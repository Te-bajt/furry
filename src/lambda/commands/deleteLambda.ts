/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'

import { LambdaClient } from '../../shared/clients/lambdaClient'
import {getLocalizedText, LOCALIZEDIDS} from '../../shared/localizedIds'

/**
 * @param message: Message displayed to user
 */
const confirm = async (message: string): Promise<boolean> => {
    // TODO: Re-use `confirm` throughout package (rather than cutting and pasting logic).
    const responseNo: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.No)
    const responseYes: string = getLocalizedText(LOCALIZEDIDS.GenericResponse.Yes)
    const response = await vscode.window.showWarningMessage(message, responseYes, responseNo)

    return response === responseYes
}

export async function deleteLambda({
    deleteParams,
    onConfirm = async () => {
        return await confirm(
            getLocalizedText(LOCALIZEDIDS.Command.DeleteLambdaConfirm,
                deleteParams.functionName
            )
        )
    },
    ...restParams
}: {
    deleteParams: { functionName: string }
    lambdaClient: Pick<LambdaClient, 'deleteFunction'> // i.e. implements LambdaClient.deleteFunction
    outputChannel: vscode.OutputChannel
    onConfirm?(): Promise<boolean>
    onRefresh(): void
}): Promise<void> {
    if (!deleteParams.functionName) {
        return
    }
    try {
        const isConfirmed = await onConfirm()
        if (isConfirmed) {
            await restParams.lambdaClient.deleteFunction(deleteParams.functionName)
            restParams.onRefresh()
        }
    } catch (err) {
        restParams.outputChannel.show(true)
        restParams.outputChannel.appendLine(
            getLocalizedText(LOCALIZEDIDS.Command.DeleteLambdaError,
                deleteParams.functionName
            )
        )
        restParams.outputChannel.appendLine(String(err)) // linter hates toString on type any
        restParams.outputChannel.appendLine('')
        restParams.onRefresh() // Refresh in case it was already deleted.
    }
}
