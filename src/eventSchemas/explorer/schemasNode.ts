/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'

import { listRegistryItems } from '../../eventSchemas/utils'
import { SchemaClient } from '../../shared/clients/schemaClient'

import { ext } from '../../shared/extensionGlobals'
import {getLocalizedText, LOCALIZEDIDS} from '../../shared/localizedIds'
import { AWSTreeErrorHandlerNode } from '../../shared/treeview/nodes/awsTreeErrorHandlerNode'
import { ErrorNode } from '../../shared/treeview/nodes/errorNode'
import { PlaceholderNode } from '../../shared/treeview/nodes/placeholderNode'
import { toMapAsync, updateInPlace } from '../../shared/utilities/collectionUtils'
import { RegistryItemNode } from './registryItemNode'

export class SchemasNode extends AWSTreeErrorHandlerNode {
    private readonly registryNodes: Map<string, RegistryItemNode>

    public constructor(public readonly regionCode: string) {
        super('Schemas', vscode.TreeItemCollapsibleState.Collapsed)
        this.registryNodes = new Map<string, RegistryItemNode>()
        this.contextValue = 'awsSchemasNode'
    }

    public async getChildren(): Promise<(RegistryItemNode | ErrorNode | PlaceholderNode)[]> {
        await this.handleErrorProneOperation(
            async () => this.updateChildren(),
            getLocalizedText(LOCALIZEDIDS.ExplorerNode.SchemasError)
        )

        if (this.errorNode) {
            return [this.errorNode]
        }

        if (this.registryNodes.size > 0) {
            return [...this.registryNodes.values()].sort((nodeA, nodeB) =>
                nodeA.registryName.localeCompare(nodeB.registryName)
            )
        }

        return [new PlaceholderNode(this, getLocalizedText(LOCALIZEDIDS.ExplorerNode.SchemasNoRegistry))]
    }

    public async updateChildren(): Promise<void> {
        const client: SchemaClient = ext.toolkitClientBuilder.createSchemaClient(this.regionCode)
        const registries = await toMapAsync(listRegistryItems(client), registry => registry.RegistryName)

        updateInPlace(
            this.registryNodes,
            registries.keys(),
            key => this.registryNodes.get(key)!.update(registries.get(key)!),
            key => new RegistryItemNode(this.regionCode, registries.get(key)!)
        )
    }
}
