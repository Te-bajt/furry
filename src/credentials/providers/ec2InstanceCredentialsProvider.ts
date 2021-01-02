/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as AWS from 'aws-sdk'
import { CredentialsProvider } from './credentialsProvider'
import { CredentialsProviderId } from './credentialsProviderId'
import { getStringHash } from '../../shared/utilities/textUtilities'

class Ec2InstanceCredentialsProvider implements CredentialsProvider {
    private static readonly CREDENTIALS_TYPE = 'ec2'
    private static readonly PROFILE_NAME = 'instance'
    private readonly provider = new AWS.CredentialProviderChain([
        () =>
            new AWS.EC2MetadataCredentials({
                httpOptions: { timeout: 5000 },
                maxRetries: 10,
            }),
    ])
    // private readonly logger: Logger = getLogger()

    public getCredentialsProviderId(): CredentialsProviderId {
        return {
            credentialType: Ec2InstanceCredentialsProvider.CREDENTIALS_TYPE,
            credentialTypeId: Ec2InstanceCredentialsProvider.PROFILE_NAME,
        }
    }
    public getDefaultRegion(): string | undefined {
        return undefined
    }
    public getHashCode(): string {
        return getStringHash(Ec2InstanceCredentialsProvider.PROFILE_NAME)
    }

    public async getCredentials(): Promise<AWS.Credentials> {
        return await this.provider.resolvePromise()
    }

    // TODO
    public canAutoConnect(): boolean {
        return false
    }

    public static getCredentialsType(): string {
        return Ec2InstanceCredentialsProvider.CREDENTIALS_TYPE
    }
}

export { Ec2InstanceCredentialsProvider }
