/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lambda } from 'aws-sdk'
import * as vscode from 'vscode'
import { LambdaClient } from '../../shared/clients/lambdaClient'
import { ext } from '../../shared/extensionGlobals'
import {getLocalizedText, LOCALIZEDIDS} from '../../shared/localizedIds'
import { AWSTreeNodeBase } from '../../shared/treeview/nodes/awsTreeNodeBase'
import { ErrorNode } from '../../shared/treeview/nodes/errorNode'
import { PlaceholderNode } from '../../shared/treeview/nodes/placeholderNode'
import { makeChildrenNodes } from '../../shared/treeview/treeNodeUtilities'
import { toArrayAsync, toMap, updateInPlace } from '../../shared/utilities/collectionUtils'
import { listLambdaFunctions } from '../utils'
import { LambdaFunctionNode } from './lambdaFunctionNode'

export const CONTEXT_VALUE_LAMBDA_FUNCTION = 'awsRegionFunctionNode'

/**
 * An AWS Explorer node representing the Lambda Service.
 * Contains Lambda Functions for a specific region as child nodes.
 */
export class LambdaNode extends AWSTreeNodeBase {
    private readonly functionNodes: Map<string, LambdaFunctionNode>

    public constructor(private readonly regionCode: string) {
        super('Lambda', vscode.TreeItemCollapsibleState.Collapsed)
        this.functionNodes = new Map<string, LambdaFunctionNode>()
    }

    public async getChildren(): Promise<AWSTreeNodeBase[]> {
        return await makeChildrenNodes({
            getChildNodes: async () => {
                await this.updateChildren()

                return [...this.functionNodes.values()]
            },
            getErrorNode: async (error: Error) =>
                new ErrorNode(this, error, getLocalizedText(LOCALIZEDIDS.ExplorerNode.Lambda.Error)),
            getNoChildrenPlaceholderNode: async () =>
                new PlaceholderNode(this, getLocalizedText(LOCALIZEDIDS.ExplorerNode.Lambda.NoFunctions)),
            sort: (nodeA: LambdaFunctionNode, nodeB: LambdaFunctionNode) =>
                nodeA.functionName.localeCompare(nodeB.functionName)
        })
    }

    public async updateChildren(): Promise<void> {
        const client: LambdaClient = ext.toolkitClientBuilder.createLambdaClient(this.regionCode)
        const functions: Map<string, Lambda.FunctionConfiguration> = toMap(
            await toArrayAsync(listLambdaFunctions(client)),
            configuration => configuration.FunctionName
        )

        updateInPlace(
            this.functionNodes,
            functions.keys(),
            key => this.functionNodes.get(key)!.update(functions.get(key)!),
            key => makeLambdaFunctionNode(this, this.regionCode, functions.get(key)!)
        )
    }
}

function makeLambdaFunctionNode(
    parent: AWSTreeNodeBase,
    regionCode: string,
    configuration: Lambda.FunctionConfiguration
): LambdaFunctionNode {
    const node = new LambdaFunctionNode(parent, regionCode, configuration)
    node.contextValue = CONTEXT_VALUE_LAMBDA_FUNCTION

    return node
}
