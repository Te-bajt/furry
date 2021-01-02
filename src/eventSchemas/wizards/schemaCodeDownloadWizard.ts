/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Set } from 'immutable'
import * as vscode from 'vscode'
import { schemaCodeDownloadDocUrl } from '../../shared/constants'
import {getLocalizedText, LOCALIZEDIDS} from '../../shared/localizedIds'
import { createHelpButton } from '../../shared/ui/buttons'

import * as picker from '../../shared/ui/picker'
import {
    BrowseFolderQuickPickItem,
    FolderQuickPickItem,
    MultiStepWizard,
    WizardContext,
    WizardStep,
    WorkspaceFolderQuickPickItem
} from '../../shared/wizards/multiStepWizard'

import * as codeLang from '../models/schemaCodeLangs'

import { SchemaItemNode } from '../explorer/schemaItemNode'

export interface SchemaCodeDownloadWizardContext {
    readonly schemaLangs: Set<codeLang.SchemaCodeLangs>
    readonly workspaceFolders: vscode.WorkspaceFolder[] | undefined

    promptUserForVersion(currSchemaVersion?: string): Promise<string | undefined>

    promptUserForLanguage(currLang?: codeLang.SchemaCodeLangs): Promise<codeLang.SchemaCodeLangs | undefined>

    promptUserForLocation(): Promise<vscode.Uri | undefined>

    showOpenDialog(options: vscode.OpenDialogOptions): Thenable<vscode.Uri[] | undefined>
}

export class DefaultSchemaCodeDownloadWizardContext extends WizardContext implements SchemaCodeDownloadWizardContext {
    public readonly schemaLangs = codeLang.schemaCodeLangs
    private readonly helpButton = createHelpButton(getLocalizedText(LOCALIZEDIDS.Command.Help))
    public constructor(private readonly node: SchemaItemNode) {
        super()
        this.node = node
    }

    public async promptUserForLanguage(
        currLanguage?: codeLang.SchemaCodeLangs
    ): Promise<codeLang.SchemaCodeLangs | undefined> {
        const quickPick = picker.createQuickPick<vscode.QuickPickItem>({
            options: {
                ignoreFocusOut: true,
                title: getLocalizedText(LOCALIZEDIDS.Schemas.DownloadCodeBindings.InitWizard.LanguagePrompt),
                value: currLanguage ? currLanguage : ''
            },
            buttons: [this.helpButton, vscode.QuickInputButtons.Back],
            items: this.schemaLangs.toArray().map(language => ({
                label: language,
                alwaysShow: language === currLanguage,
                description:
                    language === currLanguage ? getLocalizedText(LOCALIZEDIDS.Wizard.SelectedPreviously) : ''
            }))
        })

        const choices = await picker.promptUser({
            picker: quickPick,
            onDidTriggerButton: (button, resolve, reject) => {
                if (button === vscode.QuickInputButtons.Back) {
                    resolve(undefined)
                } else if (button === this.helpButton) {
                    vscode.env.openExternal(vscode.Uri.parse(schemaCodeDownloadDocUrl))
                }
            }
        })
        const val = picker.verifySinglePickerOutput(choices)

        return val ? (val.label as codeLang.SchemaCodeLangs) : undefined
    }

    public async promptUserForVersion(currSchemaVersion?: string): Promise<string | undefined> {
        const versions = await this.node.listSchemaVersions()

        const quickPick = picker.createQuickPick<vscode.QuickPickItem>({
            options: {
                ignoreFocusOut: true,
                title: getLocalizedText(LOCALIZEDIDS.Schemas.DownloadCodeBindings.InitWizard.VersionPrompt,
                    this.node.schemaName
                ),
                value: currSchemaVersion ? currSchemaVersion : ''
            },
            buttons: [this.helpButton, vscode.QuickInputButtons.Back],
            items: versions!.map(schemaVersion => ({
                label: schemaVersion.SchemaVersion!,
                alwaysShow: schemaVersion.SchemaVersion === currSchemaVersion,
                description:
                    schemaVersion === currSchemaVersion
                        ? getLocalizedText(LOCALIZEDIDS.Wizard.SelectedPreviously)
                        : ''
            }))
        })

        const choices = await picker.promptUser({
            picker: quickPick,
            onDidTriggerButton: (button, resolve, reject) => {
                if (button === vscode.QuickInputButtons.Back) {
                    resolve(undefined)
                } else if (button === this.helpButton) {
                    vscode.env.openExternal(vscode.Uri.parse(schemaCodeDownloadDocUrl))
                }
            }
        })
        const val = picker.verifySinglePickerOutput(choices)

        return val ? (val.label as codeLang.SchemaCodeLangs) : undefined
    }

    public async promptUserForLocation(): Promise<vscode.Uri | undefined> {
        const items: FolderQuickPickItem[] = (this.workspaceFolders || [])
            .map<FolderQuickPickItem>(f => new WorkspaceFolderQuickPickItem(f))
            .concat([
                new BrowseFolderQuickPickItem(
                    this,
                    getLocalizedText(LOCALIZEDIDS.Schemas.DownloadCodeBindings.InitWizard.LocationSelectFolderDetail)
                )
            ])

        const quickPick = picker.createQuickPick({
            options: {
                ignoreFocusOut: true,
                title: getLocalizedText(LOCALIZEDIDS.Schemas.DownloadCodeBindings.InitWizard.LocationPrompt)
            },
            items: items,
            buttons: [this.helpButton, vscode.QuickInputButtons.Back]
        })

        const choices = await picker.promptUser({
            picker: quickPick,
            onDidTriggerButton: (button, resolve, reject) => {
                if (button === vscode.QuickInputButtons.Back) {
                    resolve(undefined)
                } else if (button === this.helpButton) {
                    vscode.env.openExternal(vscode.Uri.parse(schemaCodeDownloadDocUrl))
                }
            }
        })
        const pickerResponse = picker.verifySinglePickerOutput<FolderQuickPickItem>(choices)

        if (!pickerResponse) {
            return undefined
        }

        if (pickerResponse instanceof BrowseFolderQuickPickItem) {
            const browseFolderResult = await pickerResponse.getUri()

            // If user cancels from Open Folder dialog, send them back to the folder picker.
            return browseFolderResult ? browseFolderResult : this.promptUserForLocation()
        }

        return pickerResponse.getUri()
    }
}

export interface SchemaCodeDownloadWizardResponse {
    language: codeLang.SchemaCodeLangs
    location: vscode.Uri
    schemaVersion: string
}

export class SchemaCodeDownloadWizard extends MultiStepWizard<SchemaCodeDownloadWizardResponse> {
    private schemaVersion?: string
    private language?: codeLang.SchemaCodeLangs
    private location?: vscode.Uri

    public constructor(private readonly context: SchemaCodeDownloadWizardContext) {
        super()
    }

    protected get startStep() {
        return this.SCHEMA_VERSION
    }

    protected getResult(): SchemaCodeDownloadWizardResponse | undefined {
        if (!this.language || !this.location || !this.schemaVersion) {
            return undefined
        }

        return {
            schemaVersion: this.schemaVersion,
            language: this.language,
            location: this.location
        }
    }

    private readonly SCHEMA_VERSION: WizardStep = async () => {
        this.schemaVersion = await this.context.promptUserForVersion(this.schemaVersion)

        return this.schemaVersion ? this.LANGUAGE : undefined
    }

    private readonly LANGUAGE: WizardStep = async () => {
        this.language = await this.context.promptUserForLanguage(this.language)

        return this.language ? this.LOCATION : this.SCHEMA_VERSION
    }

    private readonly LOCATION: WizardStep = async () => {
        this.location = await this.context.promptUserForLocation()

        return this.location ? undefined : this.LANGUAGE
    }
}
