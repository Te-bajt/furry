/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { AwsContext } from '../shared/awsContext'
import {getLocalizedText, LOCALIZEDIDS} from '../shared/localizedIds'
import { RegionProvider } from '../shared/regions/regionProvider'
import { RefreshableAwsTreeProvider } from '../shared/treeview/awsTreeProvider'
import { AWSCommandTreeNode } from '../shared/treeview/nodes/awsCommandTreeNode'
import { AWSTreeNodeBase } from '../shared/treeview/nodes/awsTreeNodeBase'
import { intersection, toMap, updateInPlace } from '../shared/utilities/collectionUtils'
import { RegionNode } from './regionNode'

export class AwsExplorer implements vscode.TreeDataProvider<AWSTreeNodeBase>, RefreshableAwsTreeProvider {
    public viewProviderId: string = 'aws.explorer'
    public readonly onDidChangeTreeData: vscode.Event<AWSTreeNodeBase | undefined>
    private readonly _onDidChangeTreeData: vscode.EventEmitter<AWSTreeNodeBase | undefined>
    private readonly regionNodes: Map<string, RegionNode>

    public constructor(private readonly awsContext: AwsContext, private readonly regionProvider: RegionProvider) {
        this._onDidChangeTreeData = new vscode.EventEmitter<AWSTreeNodeBase | undefined>()
        this.onDidChangeTreeData = this._onDidChangeTreeData.event
        this.regionNodes = new Map<string, RegionNode>()
    }

    public getTreeItem(element: AWSTreeNodeBase): vscode.TreeItem {
        return element
    }

    public async getChildren(element?: AWSTreeNodeBase): Promise<AWSTreeNodeBase[]> {
        if (!!element) {
            try {
                return await element.getChildren()
            } catch (error) {
                return [
                    new AWSCommandTreeNode(
                        element,
                        getLocalizedText(LOCALIZEDIDS.ExplorerNode.Lambda.Retry
                        ),
                        'aws.refreshAwsExplorerNode',
                        [this, element]
                    )
                ]
            }
        }

        const profileName = this.awsContext.getCredentialProfileName()
        if (!profileName) {
            return [
                new AWSCommandTreeNode(
                    undefined,
                    getLocalizedText(LOCALIZEDIDS.ExplorerNode.SignIn),
                    'aws.login',
                    undefined,
                    getLocalizedText(LOCALIZEDIDS.ExplorerNode.SignInTooltip)
                )
            ]
        }

        const explorerRegionCodes = await this.awsContext.getExplorerRegions()
        const regionMap = toMap(await this.regionProvider.getRegionData(), r => r.regionCode)

        updateInPlace(
            this.regionNodes,
            intersection(regionMap.keys(), explorerRegionCodes),
            key => this.regionNodes.get(key)!.update(regionMap.get(key)!),
            key => new RegionNode(regionMap.get(key)!)
        )

        if (this.regionNodes.size > 0) {
            return [...this.regionNodes.values()]
        } else {
            return [
                new AWSCommandTreeNode(
                    undefined,
                    getLocalizedText(LOCALIZEDIDS.ExplorerNode.AddRegion),
                    'aws.showRegion',
                    undefined,
                    getLocalizedText(LOCALIZEDIDS.ExplorerNode.AddRegionTooltip)
                )
            ]
        }
    }

    public getRegionNodesSize() {
        return this.regionNodes.size
    }

    public refresh(node?: AWSTreeNodeBase) {
        this._onDidChangeTreeData.fire(node)
    }
}
