/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as nls from 'vscode-nls'
const localize = nls.loadMessageBundle()

import * as vscode from 'vscode'
import { registerCommand } from '../shared/telemetry/telemetryUtils'
import * as picker from '../shared/ui/picker'
import {
    BrowseFolderQuickPickItem,
    FolderQuickPickItem,
    WizardContext,
    WorkspaceFolderQuickPickItem
} from '../shared/wizards/multiStepWizard'
import { createReactWebview } from '../webviews/reactLoader'
import { CreateSamAppCommands, CreateSamAppValues } from '../webviews/tsx/interfaces/createSamApp'
import { AwsComponentToBackendMessage, ReactStateDiff } from './tsx/interfaces/common'

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    registerCommand({
        command: 'aws.lambda.createNewSamAppReact',
        callback: async () => {
            await createReactWebview<CreateSamAppValues, CreateSamAppCommands>({
                id: 'create',
                name: 'Create New Sam App',
                webviewJs: 'createSamApp.js',
                onDidReceiveMessageFunction: async (message, postMessageFn, destroyWebviewFn) =>
                    createSamAppExperiment(message, postMessageFn, destroyWebviewFn),
                context
            })
        },
        telemetryName: 'project_new'
    })
}

async function createSamAppExperiment(
    output: AwsComponentToBackendMessage<CreateSamAppValues, CreateSamAppCommands>,
    postMessageFn: (event: ReactStateDiff<CreateSamAppValues>) => Thenable<boolean>,
    destroyWebviewFn: () => any
) {
    switch (output.command) {
        case 'selectDirectory':
            // prompt and select dir
            // this is a super-ugly rip from samInitWizard just to get something spun up
            const context = new WizardContext()
            const items: FolderQuickPickItem[] = (context.workspaceFolders || [])
                .map<FolderQuickPickItem>(f => new WorkspaceFolderQuickPickItem(f))
                .concat([
                    new BrowseFolderQuickPickItem(
                        context,
                        localize(
                            'AWS.samcli.initWizard.location.prompt',
                            'The folder you select will be added to your VS Code workspace.'
                        )
                    )
                ])

            const quickPick = picker.createQuickPick({
                options: {
                    ignoreFocusOut: true,
                    title: localize(
                        'AWS.samcli.initWizard.location.prompt',
                        'Select a workspace folder for your new project'
                    )
                },
                items: items,
                buttons: [vscode.QuickInputButtons.Back]
            })

            const choices = await picker.promptUser({
                picker: quickPick,
                onDidTriggerButton: (button, resolve, reject) => {
                    if (button === vscode.QuickInputButtons.Back) {
                        resolve(undefined)
                    }
                }
            })
            const pickerResponse = picker.verifySinglePickerOutput<FolderQuickPickItem>(choices)
            let dir = ''

            if (pickerResponse) {
                const temp = await pickerResponse.getUri()
                if (temp) {
                    dir = temp.toString()
                }
            }

            // send dir to webview
            // mark directory as not loading
            postMessageFn({
                values: {
                    directory: dir
                },
                loadingFields: {
                    remove: ['directory']
                }
            })

            return

        case 'createSamApp':
            // create app

            // if successful, kill webview
            destroyWebviewFn()

            return
    }
}
