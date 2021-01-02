/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Credentials } from 'aws-sdk'
import { env, Uri, ViewColumn, window } from 'vscode'
import {getLocalizedText, LOCALIZEDIDS} from '../shared/localizedIds'
import { AwsContext } from './awsContext'
import { AwsContextTreeCollection } from './awsContextTreeCollection'
import * as extensionConstants from './constants'
import { CredentialSelectionState } from './credentials/credentialSelectionState'
import {
    credentialProfileSelector,
    DefaultCredentialSelectionDataProvider,
    promptToDefineCredentialsProfile
} from './credentials/defaultCredentialSelectionDataProvider'
import { DefaultCredentialsFileReaderWriter } from './credentials/defaultCredentialsFileReaderWriter'
import { CredentialsValidationResult, UserCredentialsUtils } from './credentials/userCredentialsUtils'
import { ext } from './extensionGlobals'
import { RegionInfo } from './regions/regionInfo'
import { RegionProvider } from './regions/regionProvider'

export class DefaultAWSContextCommands {
    private readonly _awsContext: AwsContext
    private readonly _awsContextTrees: AwsContextTreeCollection
    private readonly _regionProvider: RegionProvider

    public constructor(
        awsContext: AwsContext,
        awsContextTrees: AwsContextTreeCollection,
        regionProvider: RegionProvider
    ) {
        this._awsContext = awsContext
        this._awsContextTrees = awsContextTrees
        this._regionProvider = regionProvider
    }

    public async onCommandLogin() {
        const profileName = await this.getProfileNameFromUser()
        if (!profileName) {
            // user clicked away from quick pick or entered nothing
            return
        }
        const successfulLogin = await UserCredentialsUtils.addUserDataToContext(profileName, this._awsContext)
        if (!successfulLogin) {
            await this.onCommandLogout()
            await UserCredentialsUtils.notifyUserCredentialsAreBad(profileName)
        }
    }

    public async onCommandCreateCredentialsProfile(): Promise<void> {
        const credentialsFiles: string[] = await UserCredentialsUtils.findExistingCredentialsFilenames()

        if (credentialsFiles.length === 0) {
            // Help user make a new credentials profile
            const profileName: string | undefined = await this.promptAndCreateNewCredentialsFile()

            if (profileName) {
                const successfulLogin = await UserCredentialsUtils.addUserDataToContext(profileName, this._awsContext)
                if (!successfulLogin) {
                    // credentials are invalid. Prompt user and log out
                    await this.onCommandLogout()
                    await UserCredentialsUtils.notifyUserCredentialsAreBad(profileName)
                }
            }
        } else {
            // Get the editor set up and turn things over to the user
            await this.editCredentials()
        }
    }

    public async onCommandLogout() {
        await UserCredentialsUtils.removeUserDataFromContext(this._awsContext)
    }

    public async onCommandShowRegion() {
        const explorerRegions = new Set(await this._awsContext.getExplorerRegions())
        const newRegion = await this.promptForFilteredRegion(
            candidateRegion => !explorerRegions.has(candidateRegion.regionCode)
        )

        if (newRegion) {
            await this._awsContext.addExplorerRegion(newRegion)
            this.refresh()
        }
    }

    public async onCommandHideRegion(regionCode?: string) {
        const region = regionCode || (await this.promptForRegion(await this._awsContext.getExplorerRegions()))
        if (region) {
            await this._awsContext.removeExplorerRegion(region)
            this.refresh()
        }
    }

    private refresh() {
        this._awsContextTrees.refreshTrees()
    }

    /**
     * @description Ask user for credentials information, store
     * it in new credentials file.
     *
     * @returns The profile name, or undefined if user cancelled
     */
    private async promptAndCreateNewCredentialsFile(): Promise<string | undefined> {
        while (true) {
            const dataProvider = new DefaultCredentialSelectionDataProvider([], ext.context)
            const state: CredentialSelectionState = await promptToDefineCredentialsProfile(dataProvider)

            if (!state.profileName || !state.accesskey || !state.secretKey) {
                return undefined
            }

            const validationResult: CredentialsValidationResult = await UserCredentialsUtils.validateCredentials(
                new Credentials(state.accesskey, state.secretKey)
            )

            if (validationResult.isValid) {
                await UserCredentialsUtils.generateCredentialDirectoryIfNonexistent()
                await UserCredentialsUtils.generateCredentialsFile(ext.context.extensionPath, {
                    profileName: state.profileName,
                    accessKey: state.accesskey,
                    secretKey: state.secretKey
                })

                return state.profileName
            }

            const responseNo: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.No)
            const responseYes: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.Yes)

            const response = await window.showWarningMessage(
                getLocalizedText(LOCALIZEDIDS.Message.Prompt.Credentials.DefinitionTryAgain,
                    validationResult.invalidMessage!
                ),
                responseYes,
                responseNo
            )

            if (!response || response !== responseYes) {
                return undefined
            }
        } // Keep asking until cancel or valid credentials are entered
    }

    /**
     * @description Responsible for getting a profile from the user,
     * working with them to define one if necessary.
     *
     * @returns User's selected Profile name, or undefined if none was selected.
     * undefined is also returned if we leave the user in a state where they are
     * editing their credentials file.
     */
    private async getProfileNameFromUser(): Promise<string | undefined> {
        await new DefaultCredentialsFileReaderWriter().setCanUseConfigFileIfExists()

        const responseYes: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.Yes)
        const responseNo: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.No)

        const credentialsFiles: string[] = await UserCredentialsUtils.findExistingCredentialsFilenames()

        if (credentialsFiles.length === 0) {
            const userResponse = await window.showInformationMessage(
                getLocalizedText(LOCALIZEDIDS.Message.Prompt.Credentials.Create),
                responseYes,
                responseNo
            )

            if (userResponse !== responseYes) {
                return undefined
            }

            return await this.promptAndCreateNewCredentialsFile()
        } else {
            const credentialReaderWriter = new DefaultCredentialsFileReaderWriter()
            const profileNames = await credentialReaderWriter.getProfileNames()

            // If no credentials were found, the user should be
            // encouraged to define some.
            if (profileNames.length === 0) {
                const userResponse = await window.showInformationMessage(
                    getLocalizedText(LOCALIZEDIDS.Message.Prompt.Credentials.Create),
                    responseYes,
                    responseNo
                )

                if (userResponse === responseYes) {
                    // Start edit, the user will have to try connecting again
                    // after they have made their edits.
                    await this.editCredentials()
                }

                return undefined
            }

            // If we get here, there are credentials for the user to choose from
            const dataProvider = new DefaultCredentialSelectionDataProvider(profileNames, ext.context)
            const state = await credentialProfileSelector(dataProvider)
            if (state && state.credentialProfile) {
                return state.credentialProfile.label
            }

            return undefined
        }
    }

    /**
     * @description Sets the user up to edit the credentials files.
     */
    private async editCredentials(): Promise<void> {
        const credentialsFiles: string[] = await UserCredentialsUtils.findExistingCredentialsFilenames()
        let preserveFocus: boolean = false
        let viewColumn: ViewColumn = ViewColumn.Active

        for (const filename of credentialsFiles) {
            await window.showTextDocument(Uri.file(filename), {
                preserveFocus: preserveFocus,
                preview: false,
                viewColumn: viewColumn
            })

            preserveFocus = true
            viewColumn = ViewColumn.Beside
        }

        const responseNo: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.No)
        const responseYes: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.Yes)
        const response = await window.showInformationMessage(
            getLocalizedText(LOCALIZEDIDS.Message.Prompt.Credentials.DefinitionHelp),
            responseYes,
            responseNo
        )

        if (response && response === responseYes) {
            await env.openExternal(Uri.parse(extensionConstants.aboutCredentialsFileUrl))
        }
    }

    /**
     * @description
     * Prompts the user to select a region.
     * The set shown to the user is filtered from all available regions.
     *
     * @param filter Filter to apply to the available regions
     */
    private async promptForFilteredRegion(filter: (region: RegionInfo) => boolean): Promise<string | undefined> {
        const availableRegions = await this._regionProvider.getRegionData()
        const regionsToShow = availableRegions.filter(filter).map(r => r.regionCode)

        return this.promptForRegion(regionsToShow)
    }

    /**
     * Prompts the user to select a region.
     *
     * @param regions (Optional) The regions to show the user. If none provided, all available
     * regions are shown. Regions provided must exist in the available regions to be shown.
     */
    private async promptForRegion(regions?: string[]): Promise<string | undefined> {
        const availableRegions = await this._regionProvider.getRegionData()
        const regionsToShow = availableRegions
            .filter(r => {
                if (regions) {
                    return regions.some(x => x === r.regionCode)
                }

                return true
            })
            .map(r => ({
                label: r.regionName,
                detail: r.regionCode
            }))
        const input = await window.showQuickPick(regionsToShow, {
            placeHolder: getLocalizedText(LOCALIZEDIDS.Message.SelectRegion),
            matchOnDetail: true
        })

        return input ? input.detail : undefined
    }
}
