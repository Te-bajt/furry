/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { CloudFormationClient } from '../../shared/clients/cloudFormationClient'
import { ext } from '../../shared/extensionGlobals'
import {getLocalizedText, LOCALIZEDIDS} from '../../shared/localizedIds'
import { getLogger, Logger } from '../../shared/logger'
import { CloudFormationStackNode } from '../explorer/cloudFormationNodes'

export async function deleteCloudFormation(refresh: () => void, node?: CloudFormationStackNode) {
    const logger: Logger = getLogger()
    if (!node) {
        vscode.window.showErrorMessage(
            getLocalizedText(LOCALIZEDIDS.Message.Error.CloudFormation.Unsupported)
        )

        return
    }

    const stackName = node.stackName

    const responseYes: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.Yes)
    const responseNo: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.No)

    try {
        const userResponse = await vscode.window.showInformationMessage(
            getLocalizedText(LOCALIZEDIDS.Message.Prompt.CloudFormationDelete, stackName),
            responseYes,
            responseNo
        )

        if (userResponse === responseYes) {
            const client: CloudFormationClient = ext.toolkitClientBuilder.createCloudFormationClient(node.regionCode)

            await client.deleteStack(stackName)

            vscode.window.showInformationMessage(
                getLocalizedText(LOCALIZEDIDS.Message.Info.CloudFormationDelete, stackName)
            )

            refresh()
        }
    } catch (err) {
        const error = err as Error

        vscode.window.showInformationMessage(
            getLocalizedText(LOCALIZEDIDS.Message.Error.CloudFormation.Delete,
                stackName
            )
        )

        logger.error(error)
    }
}
