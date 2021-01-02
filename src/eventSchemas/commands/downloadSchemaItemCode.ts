/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schemas } from 'aws-sdk'
import fs = require('fs')
import path = require('path')
import * as vscode from 'vscode'
import { SchemaClient } from '../../shared/clients/schemaClient'
import { makeTemporaryToolkitFolder } from '../../shared/filesystemUtilities'
import {getLocalizedText, LOCALIZEDIDS} from '../../shared/localizedIds'
import { getLogger, Logger } from '../../shared/logger'
import { ExtensionDisposableFiles } from '../../shared/utilities/disposableFiles'
import { SchemaItemNode } from '../explorer/schemaItemNode'
import { getLanguageDetails } from '../models/schemaCodeLangs'

import {
    DefaultSchemaCodeDownloadWizardContext,
    SchemaCodeDownloadWizard,
    SchemaCodeDownloadWizardResponse
} from '../wizards/schemaCodeDownloadWizard'

import * as admZip from 'adm-zip'

enum CodeGenerationStatus {
    CREATE_COMPLETE = 'CREATE_COMPLETE',
    CREATE_IN_PROGRESS = 'CREATE_IN_PROGRESS'
}

const RETRY_INTERVAL_MS = 2000
const MAX_RETRIES = 150 // p100 of Java code generation is 250 seconds. So retry for an even 5 minutes.

export async function downloadSchemaItemCode(node: SchemaItemNode) {
    const logger: Logger = getLogger()

    try {
        const wizardContext = new DefaultSchemaCodeDownloadWizardContext(node)
        const wizardResponse: SchemaCodeDownloadWizardResponse | undefined = await new SchemaCodeDownloadWizard(
            wizardContext
        ).run()
        if (!wizardResponse) {
            return
        }

        vscode.window.showInformationMessage(
            getLocalizedText(LOCALIZEDIDS.Message.Info.SchemasDownloadCodeBindings.Start, node.schemaName)
        )

        const coreFileName = getCoreFileName(node.schemaName, getLanguageDetails(wizardResponse.language).extension)
        const request: SchemaCodeDownloadRequestDetails = {
            registryName: node.registryName,
            schemaName: node.schemaName,
            language: getLanguageDetails(wizardResponse.language).apiValue,
            schemaVersion: wizardResponse.schemaVersion,
            destinationDirectory: wizardResponse.location,
            schemaCoreCodeFileName: coreFileName
        }
        const schemaCodeDownloader = createSchemaCodeDownloaderObject(node.client)
        const coreCodeFilePath = await schemaCodeDownloader.downloadCode(request)
        vscode.window.showInformationMessage(
            getLocalizedText(LOCALIZEDIDS.Message.Info.SchemasDownloadCodeBindings.Finished, request.schemaName)
        )

        if (coreCodeFilePath) {
            await vscode.window.showTextDocument(vscode.Uri.file(coreCodeFilePath))
        }
    } catch (err) {
        const error = err as Error
        let errorMessage = getLocalizedText(LOCALIZEDIDS.Message.Error.Schemas.DownloadCodeBindings.FailedToDownload)

        if (error instanceof UserNotifiedError && error.message) {
            errorMessage = error.message
        }
        vscode.window.showErrorMessage(errorMessage)
        logger.error('Error downloading schema', error)
    }
}

function getCoreFileName(schemaName: string, fileExtension: string) {
    const parsedName = schemaName.split('@')

    return parsedName[parsedName.length - 1].concat(fileExtension)
}

function createSchemaCodeDownloaderObject(client: SchemaClient): SchemaCodeDownloader {
    const downloader = new CodeDownloader(client)
    const generator = new CodeGenerator(client)
    const poller = new CodeGenerationStatusPoller(client)
    const extractor = new CodeExtractor()

    return new SchemaCodeDownloader(downloader, generator, poller, extractor)
}

export interface SchemaCodeDownloadRequestDetails {
    registryName: string
    schemaName: string
    language: string
    schemaVersion: string
    destinationDirectory: vscode.Uri
    schemaCoreCodeFileName: string
}

export class SchemaCodeDownloader {
    public constructor(
        private readonly downloader: CodeDownloader,
        private readonly generator: CodeGenerator,
        private readonly poller: CodeGenerationStatusPoller,
        private readonly extractor: CodeExtractor
    ) {}

    public async downloadCode(request: SchemaCodeDownloadRequestDetails): Promise<string | void> {
        let zipContents: ArrayBuffer
        try {
            // If the code bindings for a given schema previously generated, this would succeed
            zipContents = await this.downloader.download(request)
        } catch (err) {
            const error = err as Error
            if (error.stack && error.stack.includes('NotFoundException')) {
                //If the code generation wasn't previously kicked off, do so
                vscode.window.showInformationMessage(
                    getLocalizedText(LOCALIZEDIDS.Message.Info.SchemasDownloadCodeBindings.Generate, request.schemaName)
                )
                await this.generator.generate(request)

                //Then, poll for completion
                await this.poller.pollForCompletion(request)

                //Download generated code bindings
                vscode.window.showInformationMessage(
                    getLocalizedText(LOCALIZEDIDS.Message.Info.SchemasDownloadCodeBindings.Downloading, request.schemaName)
                )
                zipContents = await this.downloader.download(request)
            } else {
                throw err // Unexpected exception, throw
            }
        }
        vscode.window.showInformationMessage(
            getLocalizedText(LOCALIZEDIDS.Message.Info.SchemasDownloadCodeBindings.Extracting, request.schemaName)
        )

        return await this.extractor.extractAndPlace(zipContents, request)
    }
}

export class CodeGenerator {
    public constructor(public client: SchemaClient) {
        this.client = client
    }

    public async generate(
        codeDownloadRequest: SchemaCodeDownloadRequestDetails
    ): Promise<Schemas.PutCodeBindingResponse> {
        let response: Schemas.PutCodeBindingResponse
        try {
            response = await this.client.putCodeBinding(
                codeDownloadRequest.language,
                codeDownloadRequest.registryName,
                codeDownloadRequest.schemaName,
                codeDownloadRequest.schemaVersion
            )
        } catch (err) {
            const error = err as Error
            if (error.stack && error.stack!.includes('ConflictException')) {
                response = {
                    Status: CodeGenerationStatus.CREATE_IN_PROGRESS
                }
            } else {
                getLogger().error(error)
                throw new UserNotifiedError(
                    getLocalizedText(LOCALIZEDIDS.Message.Error.Schemas.DownloadCodeBindings.FailedToGenerate)
                )
            }
        }

        return response
    }
}

export class CodeGenerationStatusPoller {
    public constructor(public client: SchemaClient) {
        this.client = client
    }

    public async pollForCompletion(
        codeDownloadRequest: SchemaCodeDownloadRequestDetails,
        retryInterval: number = RETRY_INTERVAL_MS,
        maxRetries: number = MAX_RETRIES
    ): Promise<string> {
        for (let i = 0; i < maxRetries; i++) {
            const codeGenerationStatus = await this.getCurrentStatus(codeDownloadRequest)

            if (codeGenerationStatus === CodeGenerationStatus.CREATE_COMPLETE) {
                return codeGenerationStatus
            }
            if (codeGenerationStatus !== CodeGenerationStatus.CREATE_IN_PROGRESS) {
                throw new UserNotifiedError(
                    getLocalizedText(LOCALIZEDIDS.Message.Error.Schemas.DownloadCodeBindings.InvalidCodeGenerationStatus,
                        codeGenerationStatus ?? 'no status available'
                    )
                )
            }

            await new Promise<void>(resolve => setTimeout(resolve, retryInterval))
        }
        throw new UserNotifiedError(
            getLocalizedText(LOCALIZEDIDS.Message.Error.Schemas.DownloadCodeBindings.Timeout, codeDownloadRequest.schemaName)
        )
    }

    public async getCurrentStatus(codeDownloadRequest: SchemaCodeDownloadRequestDetails): Promise<string | undefined> {
        const response = await this.client.describeCodeBinding(
            codeDownloadRequest.language,
            codeDownloadRequest.registryName,
            codeDownloadRequest.schemaName,
            codeDownloadRequest.schemaVersion
        )

        return response.Status
    }
}
export class CodeDownloader {
    public constructor(public client: SchemaClient) {
        this.client = client
    }

    public async download(codeDownloadRequest: SchemaCodeDownloadRequestDetails): Promise<ArrayBuffer> {
        const response = await this.client.getCodeBindingSource(
            codeDownloadRequest.language,
            codeDownloadRequest.registryName,
            codeDownloadRequest.schemaName,
            codeDownloadRequest.schemaVersion
        )

        if (Buffer.isBuffer(response.Body)) {
            const zipContents = response.Body!.buffer

            return zipContents
        } else {
            throw new Error('Response body should be Buffer type')
        }
    }
}

export class CodeExtractor {
    public async extractAndPlace(
        zipContents: ArrayBuffer,
        request: SchemaCodeDownloadRequestDetails
    ): Promise<string | void> {
        const fileName = `${request.schemaName}.${request.schemaVersion}.${request.language}.zip`

        const codeZipDir = await this.getDisposableTempFolder()

        const codeZipFile = path.join(codeZipDir, fileName)
        const destinationDirectory = request.destinationDirectory.fsPath

        //write binary data into a temp zip file in a temp directory
        const zipContentsBinary = new Uint8Array(zipContents)
        const fd = fs.openSync(codeZipFile, 'w')
        fs.writeSync(fd, zipContentsBinary, 0, zipContentsBinary.byteLength, 0)
        fs.closeSync(fd)

        this.validateNoFileCollisions(codeZipFile, destinationDirectory)

        const zip = new admZip(codeZipFile)
        zip.extractAllTo(/*target path*/ destinationDirectory)

        const coreCodeFilePath = this.getCoreCodeFilePath(codeZipFile, request.schemaCoreCodeFileName)

        if (coreCodeFilePath) {
            return path.join(destinationDirectory, coreCodeFilePath)
        }

        return undefined
    }

    public async getDisposableTempFolder(): Promise<string> {
        const tempFolder = await makeTemporaryToolkitFolder()
        ExtensionDisposableFiles.getInstance().addFolder(tempFolder)

        return tempFolder
    }

    // Ensure that the downloaded code hierarchy has no collisions with the destination directory
    public validateNoFileCollisions(codeZipFile: string, destinationDirectory: string): void {
        const zip = new admZip(codeZipFile)
        const zipEntries = zip.getEntries()

        zipEntries.forEach(function(zipEntry) {
            if (zipEntry.isDirectory) {
                // Ignore directories because those can/will merged
            } else {
                const intendedDestinationPath = path.join(destinationDirectory, '/', zipEntry.entryName)
                if (fs.existsSync(intendedDestinationPath)) {
                    throw new UserNotifiedError(
                        getLocalizedText(LOCALIZEDIDS.Message.Error.Schemas.DownloadCodeBindings.FailedToExtractCollision, zipEntry.name)
                    )
                }
            }
        })
    }

    public getCoreCodeFilePath(codeZipFile: string, coreFileName: string): string | undefined {
        const zip = new admZip(codeZipFile)
        const zipEntries = zip.getEntries()

        for (const zipEntry of zipEntries) {
            if (zipEntry.isDirectory) {
                // Ignore directories
            } else {
                if (zipEntry.name === coreFileName) {
                    return zipEntry.entryName
                }
            }
        }

        return undefined
    }
}

class UserNotifiedError extends Error {
    public constructor(message?: string | undefined) {
        super(message)
    }
}
