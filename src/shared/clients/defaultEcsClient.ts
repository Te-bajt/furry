/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ECS } from 'aws-sdk'
import { ext } from '../extensionGlobals'
import { EcsClient } from './ecsClient'

export class DefaultEcsClient implements EcsClient {

    public constructor(
        public readonly regionCode: string
    ) { }

    public async *listClusters(): AsyncIterableIterator<string> {
        const sdkClient = await this.createSdkClient()
        const request: ECS.ListClustersRequest = {}
        do {
            const response = await this.invokeListClusters(request, sdkClient)
            if (response.clusterArns) {
                yield* response.clusterArns
            }
            request.nextToken = response.nextToken
        } while (request.nextToken)
    }

    public async describeClusters(arns: string[]): Promise<ECS.DescribeClustersResponse> {
        const sdkClient = await this.createSdkClient()
        const request: ECS.DescribeClustersRequest = {
            clusters: arns
        }

        return await this.invokeDescribeClusters(request, sdkClient)
    }

    public async *listServices(cluster: string): AsyncIterableIterator<string> {
        const sdkClient = await this.createSdkClient()
        const request: ECS.ListServicesRequest = {
            cluster
        }
        do {
            const response = await this.invokeListServices(request, sdkClient)
            if (response.serviceArns) {
                yield* response.serviceArns
            }
            request.nextToken = response.nextToken
        } while (request.nextToken)
    }

    public async describeServices(cluster: string, serviceArns: string[]): Promise<ECS.DescribeServicesResponse> {
        const sdkClient = await this.createSdkClient()
        const request: ECS.DescribeServicesRequest = {
            cluster,
            services: serviceArns
        }

        return await this.invokeDescribeServices(request, sdkClient)
    }

    public async *listTaskDefinitions(): AsyncIterableIterator<string> {
        const sdkClient = await this.createSdkClient()
        // do we also want to cover inactive? If so, would we want to use a separate function?
        const request: ECS.ListTaskDefinitionsRequest = {
            status: 'ACTIVE'
        }
        do {
            const response = await this.invokeListTaskDefinitions(request, sdkClient)
            if (response.taskDefinitionArns) {
                yield* response.taskDefinitionArns
            }
            request.nextToken = response.nextToken
        } while (request.nextToken)
    }

    public async describeTaskDefinition(arn: string): Promise<ECS.DescribeTaskDefinitionResponse> {
        const sdkClient = await this.createSdkClient()
        const request: ECS.DescribeTaskDefinitionRequest = {
            taskDefinition: arn
        }

        return await this.invokeDescribeTaskDefinition(request, sdkClient)
    }

    protected async invokeListClusters(request: ECS.ListClustersRequest, sdkClient: ECS)
        : Promise<ECS.ListClustersResponse> {
        return sdkClient.listClusters(request).promise()
    }

    protected async invokeDescribeClusters(request: ECS.DescribeClustersRequest, sdkClient: ECS)
        : Promise<ECS.DescribeClustersResponse> {
        return sdkClient.describeClusters(request).promise()
    }

    protected async invokeListServices(request: ECS.ListServicesRequest, sdkClient: ECS)
        : Promise<ECS.ListServicesResponse> {
        return sdkClient.listServices(request).promise()
    }

    protected async invokeDescribeServices(request: ECS.DescribeServicesRequest, sdkClient: ECS)
        : Promise<ECS.DescribeServicesResponse> {
        return sdkClient.describeServices(request).promise()
    }

    protected async invokeListTaskDefinitions(request: ECS.ListTaskDefinitionsRequest, sdkClient: ECS)
        : Promise<ECS.ListTaskDefinitionsResponse> {
        return sdkClient.listTaskDefinitions(request).promise()
    }

    protected async invokeDescribeTaskDefinition(request: ECS.DescribeTaskDefinitionRequest, sdkClient: ECS)
        : Promise<ECS.DescribeTaskDefinitionResponse> {
        return sdkClient.describeTaskDefinition(request).promise()
    }

    protected async createSdkClient(): Promise<ECS> {
        return await ext.sdkClientBuilder.createAndConfigureServiceClient(
            (options) => new ECS(options),
            undefined,
            this.regionCode
        )
    }
}
