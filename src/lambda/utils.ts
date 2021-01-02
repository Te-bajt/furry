/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CloudFormation, Lambda } from 'aws-sdk'
import * as vscode from 'vscode'
import { CloudFormationClient } from '../shared/clients/cloudFormationClient'
import { LambdaClient } from '../shared/clients/lambdaClient'
import {getLocalizedText, LOCALIZEDIDS} from '../shared/localizedIds'

export async function* listCloudFormationStacks(
    client: CloudFormationClient
): AsyncIterableIterator<CloudFormation.StackSummary> {
    // TODO: this 'loading' message needs to go under each regional entry
    // in the explorer, and be removed when that region's query completes
    const status = vscode.window.setStatusBarMessage(
        getLocalizedText(LOCALIZEDIDS.Message.StatusBar.Loading.CloudFormation)
    )

    try {
        yield* client.listStacks()
    } finally {
        status.dispose()
    }
}

export async function* listLambdaFunctions(client: LambdaClient): AsyncIterableIterator<Lambda.FunctionConfiguration> {
    const status = vscode.window.setStatusBarMessage(
        getLocalizedText(LOCALIZEDIDS.Message.StatusBar.Loading.Lambda)
    )

    try {
        yield* client.listFunctions()
    } finally {
        if (!!status) {
            status.dispose()
        }
    }
}
