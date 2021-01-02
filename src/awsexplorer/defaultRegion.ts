/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {getLocalizedText, LOCALIZEDIDS} from '../shared/localizedIds'

import * as vscode from 'vscode'
import { AwsContext } from '../shared/awsContext'
import { extensionSettingsPrefix } from '../shared/constants'
import { DefaultCredentialsFileReaderWriter } from '../shared/credentials/defaultCredentialsFileReaderWriter'
import { AwsExplorer } from './awsExplorer'

/**
 * The actions that can be taken when we discover that a profile's default region is not
 * showing in the Explorer.
 *
 * Keep this in sync with the onDefaultRegionMissing configuration defined in package.json.
 */
enum OnDefaultRegionMissingOperation {
    /**
     * Ask the user what they would like to happen
     */
    Prompt = 'prompt',
    /**
     * Automatically add the region to the Explorer
     */
    Add = 'add',
    /**
     * Do nothing
     */
    Ignore = 'ignore'
}

class DefaultRegionMissingPromptItems {
    public static readonly add: string = getLocalizedText(LOCALIZEDIDS.Message.Prompt.DefaultRegionHidden.Add)
    public static readonly alwaysAdd: string = getLocalizedText(LOCALIZEDIDS.Message.Prompt.DefaultRegionHidden.AlwaysAdd)
    public static readonly ignore: string = getLocalizedText(LOCALIZEDIDS.Message.Prompt.DefaultRegionHidden.Ignore)
    public static readonly alwaysIgnore: string = getLocalizedText(LOCALIZEDIDS.Message.Prompt.DefaultRegionHidden.AlwaysIgnore)
}

export async function checkExplorerForDefaultRegion(
    profileName: string,
    awsContext: AwsContext,
    awsExplorer: AwsExplorer
): Promise<void> {
    const credentialReaderWriter = new DefaultCredentialsFileReaderWriter()

    const profileRegion = await credentialReaderWriter.getDefaultRegion(profileName)
    if (!profileRegion) {
        return
    }

    const explorerRegions = new Set(await awsContext.getExplorerRegions())
    if (explorerRegions.has(profileRegion)) {
        return
    }

    // Explorer does not contain the default region. See if we should add it.
    const config = vscode.workspace.getConfiguration(extensionSettingsPrefix)

    const defaultAction = config.get<OnDefaultRegionMissingOperation>(
        'onDefaultRegionMissing',
        OnDefaultRegionMissingOperation.Prompt
    )

    // Bypass prompt if user has requested to suppress it.
    if (defaultAction === OnDefaultRegionMissingOperation.Add) {
        await awsContext.addExplorerRegion(profileRegion)
        awsExplorer.refresh()

        return
    } else if (defaultAction === OnDefaultRegionMissingOperation.Ignore) {
        return
    }

    // Ask user what to do
    const regionHiddenResponse = await vscode.window.showQuickPick(
        [
            DefaultRegionMissingPromptItems.add,
            DefaultRegionMissingPromptItems.alwaysAdd,
            DefaultRegionMissingPromptItems.ignore,
            DefaultRegionMissingPromptItems.alwaysIgnore
        ],
        {
            placeHolder: getLocalizedText(LOCALIZEDIDS.Message.Prompt.DefaultRegionHidden.CurrentlyHidden, profileRegion)
        }
    )

    // User Cancelled
    if (!regionHiddenResponse) {
        return
    }

    switch (regionHiddenResponse) {
        case DefaultRegionMissingPromptItems.add:
        case DefaultRegionMissingPromptItems.alwaysAdd:
            await awsContext.addExplorerRegion(profileRegion)
            awsExplorer.refresh()
            break
    }

    switch (regionHiddenResponse) {
        case DefaultRegionMissingPromptItems.alwaysAdd:
        case DefaultRegionMissingPromptItems.alwaysIgnore:
            // User does not want to be prompted anymore
            const action =
                regionHiddenResponse === DefaultRegionMissingPromptItems.alwaysAdd
                    ? OnDefaultRegionMissingOperation.Add
                    : OnDefaultRegionMissingOperation.Ignore
            await config.update('onDefaultRegionMissing', action, vscode.ConfigurationTarget.Global)
            vscode.window.showInformationMessage(
                getLocalizedText(LOCALIZEDIDS.Message.Prompt.DefaultRegionHidden.Suppressed, 'aws.onDefaultRegionMissing')
            )
            break
    }
}
