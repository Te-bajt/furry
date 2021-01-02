/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as nls from 'vscode-nls'
const localize = nls.loadMessageBundle()

import { CloudFormation, Lambda } from 'aws-sdk'
import * as os from 'os'
import * as vscode from 'vscode'
import { CloudFormationClient } from '../../shared/clients/cloudFormationClient'
import { LambdaClient } from '../../shared/clients/lambdaClient'
import { ext } from '../../shared/extensionGlobals'
import { AWSTreeErrorHandlerNode } from '../../shared/treeview/nodes/awsTreeErrorHandlerNode'
import { ErrorNode } from '../../shared/treeview/nodes/errorNode'
import { PlaceholderNode } from '../../shared/treeview/nodes/placeholderNode'
import { RegionNode } from '../../shared/treeview/nodes/regionNode'
import { intersection, toArrayAsync, toMap, toMapAsync, updateInPlace } from '../../shared/utilities/collectionUtils'
import { listCloudFormationStacks, listLambdaFunctions } from '../utils'
import { FunctionNodeBase } from './functionNode'

export interface CloudFormationNode extends AWSTreeErrorHandlerNode {
    readonly regionCode: string

    readonly parent: RegionNode

    getChildren(): Thenable<(CloudFormationStackNode | ErrorNode)[]>

    updateChildren(): Thenable<void>
}

async function* invokeListCloudFormationStacks(region: string): AsyncIterableIterator<CloudFormation.StackSummary> {
    const client: CloudFormationClient = ext.toolkitClientBuilder.createCloudFormationClient(region)

    return listCloudFormationStacks(client)
}

function invokeExtensionAbsolutePath(relativeExtensionPath: string): string {
    return ext.context.asAbsolutePath(relativeExtensionPath)
}

export class DefaultCloudFormationNode extends AWSTreeErrorHandlerNode implements CloudFormationNode {
    public readonly parent: RegionNode
    private readonly stackNodes: Map<string, CloudFormationStackNode>
    private readonly getCloudFormationStacks: typeof invokeListCloudFormationStacks
    private readonly getExtensionAbsolutePath: typeof invokeExtensionAbsolutePath

    public get regionCode(): string {
        return this.parent.regionCode
    }

    public constructor({
        getCloudFormationStacks = invokeListCloudFormationStacks,
        getExtensionAbsolutePath = invokeExtensionAbsolutePath,
        ...parameters
    }: {
        parent: RegionNode
        getCloudFormationStacks?: typeof invokeListCloudFormationStacks
        getExtensionAbsolutePath?: typeof invokeExtensionAbsolutePath
    }) {
        super('CloudFormation', vscode.TreeItemCollapsibleState.Collapsed)
        this.parent = parameters.parent
        this.stackNodes = new Map<string, CloudFormationStackNode>()
        this.getCloudFormationStacks = getCloudFormationStacks
        this.getExtensionAbsolutePath = getExtensionAbsolutePath
    }

    public async getChildren(): Promise<(CloudFormationStackNode | ErrorNode)[]> {
        await this.handleErrorProneOperation(
            async () => this.updateChildren(),
            localize('AWS.explorerNode.cloudFormation.error', 'Error loading CloudFormation resources')
        )

        return !!this.errorNode
            ? [this.errorNode]
            : [...this.stackNodes.values()].sort((nodeA, nodeB) => nodeA.stackName.localeCompare(nodeB.stackName))
    }

    public async updateChildren(): Promise<void> {
        const stackIdToStack = await toMapAsync(this.getCloudFormationStacks(this.regionCode), stack => stack.StackId)

        updateInPlace(
            this.stackNodes,
            stackIdToStack.keys(),
            key => this.stackNodes.get(key)!.update(stackIdToStack.get(key)!),
            key =>
                new DefaultCloudFormationStackNode(this, stackIdToStack.get(key)!, relativeExtensionPath =>
                    this.getExtensionAbsolutePath(relativeExtensionPath)
                )
        )
    }
}

export interface CloudFormationStackNode extends AWSTreeErrorHandlerNode {
    readonly regionCode: string
    readonly stackId?: CloudFormation.StackId
    readonly stackName: CloudFormation.StackName

    readonly parent: CloudFormationNode

    getChildren(): Thenable<(CloudFormationFunctionNode | PlaceholderNode)[]>

    update(stackSummary: CloudFormation.StackSummary): void
}

export class DefaultCloudFormationStackNode extends AWSTreeErrorHandlerNode implements CloudFormationStackNode {
    private readonly functionNodes: Map<string, CloudFormationFunctionNode>

    public get regionCode(): string {
        return this.parent.regionCode
    }

    public constructor(
        public readonly parent: CloudFormationNode,
        private stackSummary: CloudFormation.StackSummary,
        private readonly getExtensionAbsolutePath: (relativeExtensionPath: string) => string
    ) {
        super('', vscode.TreeItemCollapsibleState.Collapsed)

        this.update(stackSummary)
        this.contextValue = 'awsCloudFormationNode'
        this.functionNodes = new Map<string, CloudFormationFunctionNode>()
        this.iconPath = {
            dark: vscode.Uri.file(this.getExtensionAbsolutePath('resources/dark/cloudformation.svg')),
            light: vscode.Uri.file(this.getExtensionAbsolutePath('resources/light/cloudformation.svg'))
        }
    }

    public get stackId(): CloudFormation.StackId | undefined {
        return this.stackSummary.StackId
    }

    public get stackName(): CloudFormation.StackName {
        return this.stackSummary.StackName
    }

    public async getChildren(): Promise<(CloudFormationFunctionNode | PlaceholderNode)[]> {
        await this.handleErrorProneOperation(
            async () => this.updateChildren(),
            localize('AWS.explorerNode.cloudFormation.error', 'Error loading CloudFormation resources')
        )

        if (!!this.errorNode) {
            return [this.errorNode]
        }

        if (this.functionNodes.size > 0) {
            return [...this.functionNodes.values()]
        }

        return [
            new PlaceholderNode(
                this,
                localize('AWS.explorerNode.cloudFormation.noFunctions', '[no functions in this CloudFormation]')
            )
        ]
    }

    public update(stackSummary: CloudFormation.StackSummary): void {
        this.stackSummary = stackSummary
        this.label = `${this.stackName} [${stackSummary.StackStatus}]`
        this.tooltip = `${this.stackName}${os.EOL}${this.stackId}`
    }

    private async updateChildren(): Promise<void> {
        const resources: string[] = await this.resolveLambdaResources()
        const client: LambdaClient = ext.toolkitClientBuilder.createLambdaClient(this.regionCode)
        const functions: Map<string, Lambda.FunctionConfiguration> = toMap(
            await toArrayAsync(listLambdaFunctions(client)),
            functionInfo => functionInfo.FunctionName
        )

        updateInPlace(
            this.functionNodes,
            intersection(resources, functions.keys()),
            key => this.functionNodes.get(key)!.update(functions.get(key)!),
            key =>
                new DefaultCloudFormationFunctionNode(this, functions.get(key)!, relativeExtensionPath =>
                    this.getExtensionAbsolutePath(relativeExtensionPath)
                )
        )
    }

    private async resolveLambdaResources(): Promise<string[]> {
        const client: CloudFormationClient = ext.toolkitClientBuilder.createCloudFormationClient(this.regionCode)
        const response = await client.describeStackResources(this.stackSummary.StackName)

        if (response.StackResources) {
            return response.StackResources.filter(it => it.ResourceType.includes('Lambda::Function')).map(
                it => it.PhysicalResourceId || 'none'
            )
        }

        return []
    }
}

export interface CloudFormationFunctionNode extends FunctionNodeBase {
    readonly parent: CloudFormationStackNode
}

export class DefaultCloudFormationFunctionNode extends FunctionNodeBase {
    public get regionCode(): string {
        return this.parent.regionCode
    }

    public constructor(
        public readonly parent: CloudFormationStackNode,
        configuration: Lambda.FunctionConfiguration,
        getExtensionAbsolutePath: (relativeExtensionPath: string) => string
    ) {
        super(configuration, getExtensionAbsolutePath)
        this.contextValue = 'awsCloudFormationFunctionNode'
    }
}
