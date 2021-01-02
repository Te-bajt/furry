/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as os from 'os'
import * as vscode from 'vscode'
import { getLocalizedText, LOCALIZEDIDS } from '../../shared/localizedIds'

export interface WizardStep {
    (): Thenable<WizardStep | undefined>
}

export abstract class MultiStepWizard<TResult> {
    protected constructor() {}

    public async run(): Promise<TResult | undefined> {
        let step: WizardStep | undefined = this.startStep

        while (step) {
            step = await step()
        }

        return this.getResult()
    }

    protected abstract get startStep(): WizardStep

    protected abstract getResult(): TResult | undefined
}

export interface FolderQuickPickItem extends vscode.QuickPickItem {
    getUri(): Thenable<vscode.Uri | undefined>
}

export class WorkspaceFolderQuickPickItem implements FolderQuickPickItem {
    public readonly label: string

    public constructor(private readonly folder: vscode.WorkspaceFolder) {
        this.label = folder.name
    }

    public async getUri(): Promise<vscode.Uri | undefined> {
        return this.folder.uri
    }
}

export class WizardContext {
    public readonly showOpenDialog = vscode.window.showOpenDialog
    public get workspaceFolders(): vscode.WorkspaceFolder[] | undefined {
        return vscode.workspace.workspaceFolders
    }
}

export class BrowseFolderQuickPickItem implements FolderQuickPickItem {
    public alwaysShow: boolean = true

    public constructor(private readonly context: WizardContext, public readonly detail: string) {}

    public get label(): string {
        if (this.context.workspaceFolders && this.context.workspaceFolders.length > 0) {
            return getLocalizedText(LOCALIZEDIDS.InitWizard.Location.SelectFolder)
        }

        return getLocalizedText(LOCALIZEDIDS.InitWizard.Location.SelectFolderEmptyWorkspace)
    }

    public async getUri(): Promise<vscode.Uri | undefined> {
        const workspaceFolders = this.context.workspaceFolders
        const defaultUri =
            !!workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri : vscode.Uri.file(os.homedir())

        const result = await this.context.showOpenDialog({
            defaultUri,
            openLabel: getLocalizedText(LOCALIZEDIDS.InitWizard.NameBrowseOpenLabel),
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        })

        if (!result || !result.length) {
            return undefined
        }

        return result[0]
    }
}
