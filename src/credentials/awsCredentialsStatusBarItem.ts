/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { AwsContext, ContextChangeEventsArgs } from '../shared/awsContext'
import {getLocalizedText, LOCALIZEDIDS} from '../shared/localizedIds'

const STATUSBAR_PRIORITY = 100
const STATUSBAR_TEXT_NO_CREDENTIALS = getLocalizedText(LOCALIZEDIDS.CredentialsStatusBar.NoCredentials)

export async function initializeAwsCredentialsStatusBarItem(
    awsContext: AwsContext,
    context: vscode.ExtensionContext
): Promise<void> {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, STATUSBAR_PRIORITY)
    statusBarItem.command = 'aws.login'
    statusBarItem.tooltip = getLocalizedText(LOCALIZEDIDS.CredentialsStatusBar.Tooltip)
    statusBarItem.show()

    context.subscriptions.push(statusBarItem)

    context.subscriptions.push(
        awsContext.onDidChangeContext(async (awsContextChangedEvent: ContextChangeEventsArgs) => {
            updateCredentialsStatusBarItem(statusBarItem, awsContextChangedEvent.profileName)
        })
    )
}

export function updateCredentialsStatusBarItem(statusBarItem: vscode.StatusBarItem, credentialsId?: string) {
    statusBarItem.text = getLocalizedText(LOCALIZEDIDS.CredentialsStatusBar.Text, credentialsId ?? STATUSBAR_TEXT_NO_CREDENTIALS)
}
