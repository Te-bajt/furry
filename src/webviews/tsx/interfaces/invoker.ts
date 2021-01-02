/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'

import { LambdaFunctionNode } from '../../../lambda/explorer/lambdaFunctionNode'
import { SelectOption } from './common'

export interface InvokerValues {
    region: string
    lambda: string
    template: string
    payload: string
    availableTemplates: SelectOption[]
}

export interface InvokerContext {
    node: LambdaFunctionNode
    outputChannel: vscode.OutputChannel
}
