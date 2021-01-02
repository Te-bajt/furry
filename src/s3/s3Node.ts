/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

import * as vscode from 'vscode'
import { AWSTreeNodeBase } from '../shared/treeview/nodes/awsTreeNodeBase'
import { PlaceholderNode } from '../shared/treeview/nodes/placeholderNode'
import { ErrorNode } from '../shared/treeview/nodes/errorNode'
import { makeChildrenNodes } from '../shared/treeview/treeNodeUtilities'
import { ext } from '../shared/extensionGlobals'

export class S3ObjectNode extends AWSTreeNodeBase {
    public constructor(
        public readonly parent: AWSTreeNodeBase,
        public readonly regionCode: string,
        public name: string
    ) {
        super('')
        this.update()
        this.iconPath = {
            dark: vscode.Uri.file(ext.iconPaths.dark.lambda),
            light: vscode.Uri.file(ext.iconPaths.light.lambda)
        }
    }
    public update(): void {
        this.label = `TODO label: ${this.name}`
        this.tooltip = `TODO tooltip: ${this.name}`
    }
    
}

/**
 * Root "node" of a tree of S3 objects in the AWS Explorer.
 */
export class S3Node extends AWSTreeNodeBase {
    private readonly nodes: Map<string, S3ObjectNode>

    public constructor(private readonly regionCode: string) {
        super('S3', vscode.TreeItemCollapsibleState.Collapsed)
        this.nodes = new Map<string, S3ObjectNode>()
    }

    public async getChildren(): Promise<AWSTreeNodeBase[]> {
        return await makeChildrenNodes({
            getChildNodes: async () => {
                await this.updateChildren()
                return [...this.nodes.values()]
            },
            getErrorNode: async (error: Error) =>
                new ErrorNode(this, error, 'TODO: localize, error message'),
            getNoChildrenPlaceholderNode: async () =>
                new PlaceholderNode(this, 'TODO: localize, error message'),
            sort: (nodeA: S3ObjectNode, nodeB: S3ObjectNode) =>
                nodeA.name.localeCompare(nodeB.name)
        })
    }

    public async updateChildren(): Promise<void> {
        const region = 'us-west-2'
        // TODO
        // const client: S3Client = ext.toolkitClientBuilder.createS3client(this.regionCode)
        const s3objects: { [key: string]: S3ObjectNode } = {
            'object1': new S3ObjectNode(this, region, 'dummy-object1'),
            'object2': new S3ObjectNode(this, region, 'dummy-object2'),
            'object3': new S3ObjectNode(this, region, 'dummy-object3'),
        }

        for (let [key, val] of Object.entries(s3objects)) {
            this.nodes.set(key, val)
        }
        // updateInPlace(
        //     this.nodes,
        //     Object.getOwnPropertyNames(s3objects),
        //     key => this.nodes.get(key)!.update((s3objects[key]! as S3ObjectNode).name),
        //     key => makeLambdaFunctionNode(this, this.regionCode, functions.get(key)!)
        // )
    }
}

