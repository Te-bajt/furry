/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as AsyncLock from 'async-lock'
import * as AWS from 'aws-sdk'
import * as vscode from 'vscode'
import {getLocalizedText, LOCALIZEDIDS} from '../shared/localizedIds'

/**
 * @description Encapsulates the setup and caching of credentials profiles
 */
export class CredentialsManager {
    private static readonly userCancelledMfaError: string = getLocalizedText(LOCALIZEDIDS.Error.MFAUserCancelled)
    private readonly _credentialsCache: { [key: string]: AWS.Credentials }
    private readonly _asyncLock: AsyncLock

    public constructor() {
        this._credentialsCache = {}
        this._asyncLock = new AsyncLock()
    }

    /**
     * @description Retrieves the requested credentials profile, creating it if necessary.
     * An exception is thrown if the profile name is not found or if there is an issue setting up the profile
     * @param profileName Profile to retrieve
     */
    public async getCredentials(profileName: string): Promise<AWS.Credentials> {
        const credentials = await this._asyncLock.acquire(`credentials.lock.${profileName}`, async () => {
            if (!this._credentialsCache[profileName]) {
                this._credentialsCache[profileName] = await this.createCredentials(profileName)
            }

            return this._credentialsCache[profileName]
        })

        return credentials
    }

    /**
     * Instantiates credentials for the specified profile
     *
     * @param profileName Profile to set up
     */
    private async createCredentials(profileName: string): Promise<AWS.Credentials> {
        const provider = new AWS.CredentialProviderChain([
            () => new AWS.ProcessCredentials({ profile: profileName }),
            () =>
                new AWS.SharedIniFileCredentials({
                    profile: profileName,
                    tokenCodeFn: async (mfaSerial, callback) =>
                        await CredentialsManager.getMfaTokenFromUser(mfaSerial, profileName, callback)
                })
        ])

        return provider.resolvePromise()
    }

    /**
     * @description Prompts user for MFA token
     *
     * Entered token is passed to the callback.
     * If user cancels out, the callback is passed an error with a fixed message string.
     *
     * @param mfaSerial Serial arn of MFA device
     * @param profileName Name of Credentials profile we are asking an MFA Token for
     * @param callback tokens/errors are passed through here
     */
    private static async getMfaTokenFromUser(
        mfaSerial: string,
        profileName: string,
        callback: (err?: Error, token?: string) => void
    ): Promise<void> {
        try {
            const token = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: getLocalizedText(LOCALIZEDIDS.PromptMFAEnterCode.Placeholder),
                prompt: getLocalizedText(LOCALIZEDIDS.PromptMFAEnterCode.Prompt,
                    profileName
                )
            })

            // Distinguish user cancel vs code entry issues
            if (!token) {
                throw new Error(CredentialsManager.userCancelledMfaError)
            }

            callback(undefined, token)
        } catch (err) {
            const error = err as Error
            callback(error)
        }
    }
}
