/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ECS } from 'aws-sdk'

export interface EcsClient {
    readonly regionCode: string

    listClusters(): AsyncIterableIterator<string>

    describeClusters(arns: string[]): Promise<ECS.DescribeClustersResponse>

    listServices(cluster: string): AsyncIterableIterator<string>

    describeServices(cluster: string, serviceArns: string[]): Promise<ECS.DescribeServicesResponse>

    listTaskDefinitions(): AsyncIterableIterator<string>

    describeTaskDefinition(arn: string): Promise<ECS.DescribeTaskDefinitionResponse>
}
