/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path'
import * as vscode from 'vscode'
import * as xml2js from 'xml2js'

import { deleteCloudFormation } from '../lambda/commands/deleteCloudFormation'
import { deleteLambda } from '../lambda/commands/deleteLambda'
import { invokeLambda } from '../lambda/commands/invokeLambda'
import { sampleRequestManifestPath, sampleRequestPath } from '../lambda/constants'
import { CloudFormationStackNode } from '../lambda/explorer/cloudFormationNodes'
import { LambdaFunctionNode } from '../lambda/explorer/lambdaFunctionNode'
import { AwsContext } from '../shared/awsContext'
import { AwsContextTreeCollection } from '../shared/awsContextTreeCollection'
import { LambdaClient } from '../shared/clients/lambdaClient'
import { ext } from '../shared/extensionGlobals'
import { safeGet } from '../shared/extensionUtilities'
import { RegionProvider } from '../shared/regions/regionProvider'
import { ResourceFetcher } from '../shared/resourceFetcher'
import { FileResourceLocation, WebResourceLocation } from '../shared/resourceLocation'
import { TelemetryNamespace } from '../shared/telemetry/telemetryTypes'
import { registerCommand } from '../shared/telemetry/telemetryUtils'
import { AWSTreeNodeBase } from '../shared/treeview/nodes/awsTreeNodeBase'
import { ErrorNode } from '../shared/treeview/nodes/errorNode'
import { showErrorDetails } from '../shared/treeview/webviews/showErrorDetails'
import { createReactWebview } from '../webviews/reactLoader'
import {
    AwsComponentToBackendMessage,
    BackendToAwsComponentMessage,
    SelectOption
} from '../webviews/tsx/interfaces/common'
import { InvokerContext, InvokerValues } from '../webviews/tsx/interfaces/invoker'
import { AwsExplorer } from './awsExplorer'
import { RegionNode } from './regionNode'

/**
 * Activate AWS Explorer related functionality for the extension.
 */

export async function activate(activateArguments: {
    awsContext: AwsContext
    context: vscode.ExtensionContext
    awsContextTrees: AwsContextTreeCollection
    regionProvider: RegionProvider
    resourceFetcher: ResourceFetcher
}): Promise<void> {
    const awsExplorer = new AwsExplorer(activateArguments.awsContext, activateArguments.regionProvider)

    activateArguments.context.subscriptions.push(
        vscode.window.registerTreeDataProvider(awsExplorer.viewProviderId, awsExplorer)
    )

    await registerAwsExplorerCommands(awsExplorer, activateArguments.awsContext, activateArguments.resourceFetcher)

    await registerExperimentalCommand(activateArguments.context, activateArguments.resourceFetcher)

    activateArguments.awsContextTrees.addTree(awsExplorer)
}

async function registerAwsExplorerCommands(
    awsExplorer: AwsExplorer,
    awsContext: AwsContext,
    resourceFetcher: ResourceFetcher,
    lambdaOutputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('AWS Lambda')
): Promise<void> {
    registerCommand({
        command: 'aws.showRegion',
        callback: async () => await ext.awsContextCommands.onCommandShowRegion()
    })

    registerCommand({
        command: 'aws.hideRegion',
        callback: async (node?: RegionNode) => {
            await ext.awsContextCommands.onCommandHideRegion(safeGet(node, x => x.regionCode))
        }
    })

    registerCommand({
        command: 'aws.refreshAwsExplorer',
        callback: async () => awsExplorer.refresh()
    })

    registerCommand({
        command: 'aws.deleteLambda',
        callback: async (node: LambdaFunctionNode) =>
            await deleteLambda({
                deleteParams: { functionName: node.configuration.FunctionName || '' },
                lambdaClient: ext.toolkitClientBuilder.createLambdaClient(node.regionCode),
                outputChannel: lambdaOutputChannel,
                onRefresh: () => awsExplorer.refresh(node.parent)
            }),
        telemetryName: {
            namespace: TelemetryNamespace.Lambda,
            name: 'delete'
        }
    })

    registerCommand({
        command: 'aws.deleteCloudFormation',
        callback: async (node: CloudFormationStackNode) =>
            await deleteCloudFormation(() => awsExplorer.refresh(node.parent), node),
        telemetryName: {
            namespace: TelemetryNamespace.Cloudformation,
            name: 'delete'
        }
    })

    registerCommand({
        command: 'aws.showErrorDetails',
        callback: async (node: ErrorNode) => await showErrorDetails(node)
    })

    registerCommand({
        command: 'aws.invokeLambda',
        callback: async (node: LambdaFunctionNode) =>
            await invokeLambda({
                awsContext: awsContext,
                functionNode: node,
                outputChannel: lambdaOutputChannel,
                resourceFetcher: resourceFetcher
            }),
        telemetryName: {
            namespace: TelemetryNamespace.Lambda,
            name: 'invokeremote'
        }
    })

    registerCommand({
        command: 'aws.refreshAwsExplorerNode',
        callback: async (awsexplorer: AwsExplorer, element: AWSTreeNodeBase) => {
            awsexplorer.refresh(element)
        }
    })
}

interface SampleRequestManifest {
    requests: {
        request: {
            name?: string
            filename?: string
        }[]
    }
}

async function registerExperimentalCommand(
    context: vscode.ExtensionContext,
    resourceFetcher: ResourceFetcher,
    outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('AWS Lambda')
) {
    registerCommand({
        command: 'aws.invokeLambdaReact',
        callback: async (node: LambdaFunctionNode) => {
            const handlerContext: InvokerContext = {
                node,
                outputChannel
            }

            const sampleInput = await resourceFetcher.getResource([
                new WebResourceLocation(sampleRequestManifestPath),
                new FileResourceLocation(
                    path.join(ext.context.extensionPath, 'resources', 'vs-lambda-sample-request-manifest.xml')
                )
            ])

            const availableTemplates: SelectOption[] = []

            xml2js.parseString(sampleInput, { explicitArray: false }, (err: Error, result: SampleRequestManifest) => {
                if (err) {
                    return
                }

                const requests = result.requests.request

                for (const request of requests) {
                    availableTemplates.push({
                        value: request.filename || '',
                        displayName: request.name || ''
                    })
                }
            })

            await createReactWebview<InvokerValues, InvokerContext>({
                id: 'invoke',
                name: 'Sample Invoker!',
                webviewJs: 'invokeRemote.js',
                handlerContext,
                onDidReceiveMessageFunction: async (message, postMessageFn) =>
                    invokeLambdaExperiment(message, postMessageFn, handlerContext, resourceFetcher),
                onDidDisposeFunction: () => {},
                context,
                initialState: {
                    values: {
                        region: node.regionCode,
                        lambda: node.configuration.FunctionName || '',
                        payload: '{}',
                        template: '',
                        availableTemplates
                    }
                }
            })
        },
        telemetryName: {
            namespace: TelemetryNamespace.Aws,
            name: 'reactInvoker'
        }
    })
}

async function invokeLambdaExperiment(
    output: AwsComponentToBackendMessage<InvokerValues>,
    postMessageFn: (event: BackendToAwsComponentMessage<InvokerValues>) => Thenable<boolean>,
    context: InvokerContext,
    resourceFetcher: ResourceFetcher
) {
    const outputChannel = context.outputChannel
    const fn = context.node
    outputChannel.show()

    switch (output.command) {
        case 'daBomb':
            for (let i = 30; i >= 0; i--) {
                await new Promise<void>(resolve => {
                    setTimeout(() => {
                        postMessageFn({
                            values: {
                                payload: i > 0 ? i.toString() : 'Boom!'
                            }
                        })
                        resolve()
                    }, 1000)
                })
            }

            return

        case 'sampleRequestSelected':
            const sample = await resourceFetcher.getResource([
                new WebResourceLocation(`${sampleRequestPath}${output.values.template}`),
                new FileResourceLocation(
                    path.join(ext.context.extensionPath, 'resources', 'vs-lambda-sample-request-manifest.xml')
                )
            ])

            postMessageFn({
                values: {
                    payload: sample
                },
                inactiveFields: {
                    remove: ['payload', 'template']
                },
                loadingFields: {
                    remove: ['payload']
                },
                invalidFields: {
                    remove: ['payload']
                }
            })

            return

        case 'invokeLambda':
            outputChannel.appendLine('Loading response...')
            try {
                if (!fn.configuration.FunctionArn) {
                    throw new Error(`Could not determine ARN for function ${fn.configuration.FunctionName}`)
                }
                const client: LambdaClient = ext.toolkitClientBuilder.createLambdaClient(fn.regionCode)
                const funcResponse = await client.invoke(fn.configuration.FunctionArn, output.values.payload)
                const logs = funcResponse.LogResult ? Buffer.from(funcResponse.LogResult, 'base64').toString() : ''
                const payload = funcResponse.Payload ? funcResponse.Payload : JSON.stringify({})

                outputChannel.appendLine(`Invocation result for ${fn.configuration.FunctionArn}`)
                outputChannel.appendLine('Logs:')
                outputChannel.appendLine(logs)
                outputChannel.appendLine('')
                outputChannel.appendLine('Payload:')
                outputChannel.appendLine(payload.toString())
                outputChannel.appendLine('')
            } catch (e) {
                const error = e as Error
                outputChannel.appendLine(`There was an error invoking ${fn.configuration.FunctionArn}`)
                outputChannel.appendLine(error.toString())
                outputChannel.appendLine('')
            }

            return
    }
}
