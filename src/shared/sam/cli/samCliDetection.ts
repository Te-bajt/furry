/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as AsyncLock from 'async-lock'
import * as vscode from 'vscode'
import { getLocalizedText, LOCALIZEDIDS } from '../../../shared/localizedIds'
import { extensionSettingsPrefix, samAboutInstallUrl } from '../../constants'
import { DefaultSettingsConfiguration } from '../../settingsConfiguration'
import { DefaultSamCliConfiguration, SamCliConfiguration } from './samCliConfiguration'
import { DefaultSamCliLocationProvider } from './samCliLocator'

const lock = new AsyncLock()

const learnMore = getLocalizedText(LOCALIZEDIDS.SAMCLI.UserChoice.VisitInstallURL)

const browseToSamCli = getLocalizedText(LOCALIZEDIDS.SAMCLI.UserChoice.Browse)

const settingsUpdated = getLocalizedText(LOCALIZEDIDS.SAMCLI.DetectSettings.Updated)

const settingsNotUpdated = getLocalizedText(LOCALIZEDIDS.SAMCLI.DetectSettings.NotUpdated)

export async function detectSamCli(showMessageIfDetected: boolean): Promise<void> {
    await lock.acquire('detect SAM CLI', async () => {
        const samCliConfig = new DefaultSamCliConfiguration(
            new DefaultSettingsConfiguration(extensionSettingsPrefix),
            new DefaultSamCliLocationProvider()
        )

        const initialSamCliLocation = samCliConfig.getSamCliLocation()

        await samCliConfig.initialize()

        const currentsamCliLocation = samCliConfig.getSamCliLocation()

        if (showMessageIfDetected) {
            if (!currentsamCliLocation) {
                notifyUserSamCliNotDetected(samCliConfig)
            } else {
                const message: string =
                    initialSamCliLocation === currentsamCliLocation
                        ? getSettingsNotUpdatedMessage(initialSamCliLocation)
                        : getSettingsUpdatedMessage(currentsamCliLocation)

                vscode.window.showInformationMessage(message)
            }
        }
    })
}

function notifyUserSamCliNotDetected(samCliConfig: SamCliConfiguration): void {
    // inform the user, but don't wait for this to complete
    vscode.window
        .showErrorMessage(getLocalizedText(LOCALIZEDIDS.SAMCLI.Error.NotFound), learnMore, browseToSamCli)
        .then(async userResponse => {
            if (userResponse === learnMore) {
                await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(samAboutInstallUrl))
            } else if (userResponse === browseToSamCli) {
                const location: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    openLabel: 'Apply location to Settings'
                })

                if (!!location && location.length === 1) {
                    const path: string = location[0].fsPath
                    await samCliConfig.setSamCliLocation(path)
                    vscode.window.showInformationMessage(getSettingsUpdatedMessage(path))
                }
            }
        })
}

function getSettingsUpdatedMessage(location: string): string {
    const configuredLocation = getLocalizedText(LOCALIZEDIDS.SAMCLI.ConfiguredLocation, location)

    return `${settingsUpdated} ${configuredLocation}`
}

function getSettingsNotUpdatedMessage(location: string): string {
    const configuredLocation = getLocalizedText(LOCALIZEDIDS.SAMCLI.ConfiguredLocation, location)

    return `${settingsNotUpdated} ${configuredLocation}`
}
