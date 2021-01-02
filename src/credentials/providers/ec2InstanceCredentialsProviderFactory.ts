/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseCredentialsProviderFactory } from './credentialsProviderFactory'
import { Ec2InstanceCredentialsProvider } from './Ec2InstanceCredentialsProvider'

class Ec2InstanceCredentialsProviderFactory extends BaseCredentialsProviderFactory<Ec2InstanceCredentialsProvider> {
    private readonly instanceCredsProvider = new Ec2InstanceCredentialsProvider()
    public getCredentialType(): string {
        return Ec2InstanceCredentialsProvider.getCredentialsType()
    }

    public async refresh(): Promise<void> {
        const creds = await this.instanceCredsProvider.getCredentials()
        if (creds.needsRefresh()) {
            this.resetProviders()
            await creds.refreshPromise()
            this.addProvider(this.instanceCredsProvider)
        }
    }
}

export { Ec2InstanceCredentialsProviderFactory }
