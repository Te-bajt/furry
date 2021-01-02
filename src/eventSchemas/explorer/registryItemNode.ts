/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schemas } from 'aws-sdk'
import * as os from 'os'
import * as vscode from 'vscode'

import { listSchemaItems } from '../utils'

import { SchemaClient } from '../../shared/clients/schemaClient'
import { ext } from '../../shared/extensionGlobals'
import {getLocalizedText, LOCALIZEDIDS} from '../../shared/localizedIds'
import { AWSTreeErrorHandlerNode } from '../../shared/treeview/nodes/awsTreeErrorHandlerNode'
import { PlaceholderNode } from '../../shared/treeview/nodes/placeholderNode'
import { toMapAsync, updateInPlace } from '../../shared/utilities/collectionUtils'
import { SchemaItemNode } from './schemaItemNode'

export class RegistryItemNode extends AWSTreeErrorHandlerNode {
    private readonly schemaNodes: Map<string, SchemaItemNode>

    public constructor(public readonly regionCode: string, private registryItemOutput: Schemas.RegistrySummary) {
        super('', vscode.TreeItemCollapsibleState.Collapsed)

        this.update(registryItemOutput)
        this.contextValue = 'awsRegistryItemNode'
        this.schemaNodes = new Map<string, SchemaItemNode>()
        this.iconPath = {
            dark: vscode.Uri.file(ext.iconPaths.dark.registry),
            light: vscode.Uri.file(ext.iconPaths.light.registry)
        }
    }

    public get registryName(): string {
        return (
            this.registryItemOutput.RegistryName ||
            getLocalizedText(LOCALIZEDIDS.ExplorerNode.Registry.RegistryNameNotFound)
        )
    }

    public async getChildren(): Promise<(SchemaItemNode | PlaceholderNode)[]> {
        await this.handleErrorProneOperation(
            async () => this.updateChildren(),
            getLocalizedText(LOCALIZEDIDS.ExplorerNode.Registry.Error)
        )

        if (this.errorNode) {
            return [this.errorNode]
        }

        if (this.schemaNodes.size > 0) {
            return [...this.schemaNodes.values()].sort((nodeA, nodeB) =>
                nodeA.schemaName.localeCompare(nodeB.schemaName)
            )
        }

        return [
            new PlaceholderNode(this, getLocalizedText(LOCALIZEDIDS.ExplorerNode.Registry.NoSchemas))
        ]
    }

    public update(registryItemOutput: Schemas.RegistrySummary): void {
        this.registryItemOutput = registryItemOutput
        this.label = `${this.registryName}`
        let registryArn = ''
        if (this.registryItemOutput.RegistryArn) {
            registryArn = `${os.EOL}${this.registryItemOutput.RegistryArn}`
        }
        this.tooltip = `${this.registryName}${registryArn}`
    }

    public async updateChildren(): Promise<void> {
        const client: SchemaClient = ext.toolkitClientBuilder.createSchemaClient(this.regionCode)
        const schemas = await toMapAsync(listSchemaItems(client, this.registryName), schema => schema.SchemaName)

        updateInPlace(
            this.schemaNodes,
            schemas.keys(),
            key => this.schemaNodes.get(key)!.update(schemas.get(key)!),
            key => new SchemaItemNode(schemas.get(key)!, client, this.registryName)
        )
    }
}
