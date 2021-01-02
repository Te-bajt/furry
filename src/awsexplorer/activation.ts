/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import * as xml2js from 'xml2js'

import { deleteCloudFormation } from '../lambda/commands/deleteCloudFormation'
import { deleteLambda } from '../lambda/commands/deleteLambda'
import { invokeLambda } from '../lambda/commands/invokeLambda'
import { sampleRequestManifestPath, sampleRequestPath } from '../lambda/constants'
import { CloudFormationStackNode } from '../lambda/explorer/cloudFormationNodes'
import { LambdaFunctionNode } from '../lambda/explorer/lambdaFunctionNode'
import { AwsContext } from '../shared/awsContext'
import { AwsContextTreeCollection } from '../shared/awsContextTreeCollection'
import { LambdaClient } from '../shared/clients/lambdaClient'
import { ext } from '../shared/extensionGlobals'
import { safeGet } from '../shared/extensionUtilities'
import { getLogger } from '../shared/logger'
import { RegionProvider } from '../shared/regions/regionProvider'
import { CompositeResourceFetcher } from '../shared/resourcefetcher/compositeResourceFetcher'
import { FileResourceFetcher } from '../shared/resourcefetcher/fileResourceFetcher'
import { HttpResourceFetcher } from '../shared/resourcefetcher/httpResourceFetcher'
import { ResourceFetcher } from '../shared/resourcefetcher/resourcefetcher'
import { registerCommand } from '../shared/telemetry/telemetryUtils'
import { AWSTreeNodeBase } from '../shared/treeview/nodes/awsTreeNodeBase'
import { ErrorNode } from '../shared/treeview/nodes/errorNode'
import { showErrorDetails } from '../shared/treeview/webviews/showErrorDetails'
import { createReactWebview } from '../webviews/reactLoader'
import { AwsComponentToBackendMessage, ReactStateDiff, SelectOption } from '../webviews/tsx/interfaces/common'
import { InvokerCommands, InvokerContext, InvokerValues } from '../webviews/tsx/interfaces/invoker'
import { AwsExplorer } from './awsExplorer'
import { checkExplorerForDefaultRegion } from './defaultRegion'
import { RegionNode } from './regionNode'

/**
 * Activate AWS Explorer related functionality for the extension.
 */

export async function activate(activateArguments: {
    awsContext: AwsContext
    context: vscode.ExtensionContext
    awsContextTrees: AwsContextTreeCollection
    regionProvider: RegionProvider
}): Promise<void> {
    const awsExplorer = new AwsExplorer(activateArguments.awsContext, activateArguments.regionProvider)

    activateArguments.context.subscriptions.push(
        vscode.window.registerTreeDataProvider(awsExplorer.viewProviderId, awsExplorer)
    )

    await registerAwsExplorerCommands(awsExplorer)

    await recordNumberOfActiveRegionsMetric(awsExplorer)

    await registerExperimentalCommand(activateArguments.context)

    activateArguments.awsContextTrees.addTree(awsExplorer)

    updateAwsExplorerWhenAwsContextCredentialsChange(
        awsExplorer,
        activateArguments.awsContext,
        activateArguments.context
    )
}

async function registerAwsExplorerCommands(
    awsExplorer: AwsExplorer,
    lambdaOutputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('AWS Lambda')
): Promise<void> {
    registerCommand({
        command: 'aws.showRegion',
        callback: async () => {
            await ext.awsContextCommands.onCommandShowRegion()
            await recordNumberOfActiveRegionsMetric(awsExplorer)
        },
        telemetryName: 'Command_aws.showRegion'
    })

    registerCommand({
        command: 'aws.hideRegion',
        callback: async (node?: RegionNode) => {
            await ext.awsContextCommands.onCommandHideRegion(safeGet(node, x => x.regionCode))
            await recordNumberOfActiveRegionsMetric(awsExplorer)
        },
        telemetryName: 'Command_aws.hideRegion'
    })

    registerCommand({
        command: 'aws.refreshAwsExplorer',
        callback: async () => awsExplorer.refresh(),
        telemetryName: 'Command_aws.refreshAwsExplorer'
    })

    registerCommand({
        command: 'aws.deleteLambda',
        callback: async (node: LambdaFunctionNode) =>
            await deleteLambda({
                deleteParams: { functionName: node.configuration.FunctionName || '' },
                lambdaClient: ext.toolkitClientBuilder.createLambdaClient(node.regionCode),
                outputChannel: lambdaOutputChannel,
                onRefresh: () => awsExplorer.refresh(node.parent)
            }),
        telemetryName: 'lambda_delete'
    })

    registerCommand({
        command: 'aws.deleteCloudFormation',
        callback: async (node: CloudFormationStackNode) =>
            await deleteCloudFormation(() => awsExplorer.refresh(node.parent), node),
        telemetryName: 'cloudformation_delete'
    })

    registerCommand({
        command: 'aws.showErrorDetails',
        callback: async (node: ErrorNode) => await showErrorDetails(node),
        telemetryName: 'Command_aws.showErrorDetails'
    })

    registerCommand({
        command: 'aws.invokeLambda',
        callback: async (node: LambdaFunctionNode) =>
            await invokeLambda({
                functionNode: node,
                outputChannel: lambdaOutputChannel
            }),
        telemetryName: 'lambda_invokeremote'
    })

    registerCommand({
        command: 'aws.refreshAwsExplorerNode',
        callback: async (awsexplorer: AwsExplorer, element: AWSTreeNodeBase) => {
            awsexplorer.refresh(element)
        },
        telemetryName: 'Command_aws.refreshAwsExplorerNode'
    })
}

interface SampleRequestManifest {
    requests: {
        request: {
            name?: string
            filename?: string
        }[]
    }
}

async function registerExperimentalCommand(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('AWS Lambda')
) {
    registerCommand({
        command: 'aws.invokeLambdaReact',
        callback: async (node: LambdaFunctionNode) => {
            const handlerContext: InvokerContext = {
                node,
                outputChannel
            }

            const sampleInput = await makeSampleRequestManifestResourceFetcher().get()

            if (!sampleInput) {
                throw new Error('Unable to retrieve Sample Request manifest')
            }

            const availableTemplates: SelectOption[] = []

            xml2js.parseString(sampleInput, { explicitArray: false }, (err: Error, result: SampleRequestManifest) => {
                if (err) {
                    return
                }

                const requests = result.requests.request

                for (const request of requests) {
                    availableTemplates.push({
                        value: request.filename || '',
                        displayName: request.name || ''
                    })
                }
            })

            await createReactWebview<InvokerValues, InvokerCommands>({
                id: 'invoke',
                name: 'Sample Invoker!',
                webviewJs: 'invokeRemote.js',
                onDidReceiveMessageFunction: async (message, postMessageFn, destroyWebviewFn) =>
                    invokeLambdaExperiment(message, postMessageFn, destroyWebviewFn, handlerContext),
                context,
                initialState: {
                    values: {
                        region: node.regionCode,
                        lambda: node.configuration.FunctionName || '',
                        payload: '{}',
                        template: '',
                        availableTemplates
                    }
                }
            })
        },
        telemetryName: 'lambda_reactInvoker'
    })
}

async function invokeLambdaExperiment(
    output: AwsComponentToBackendMessage<InvokerValues, InvokerCommands>,
    postMessageFn: (event: ReactStateDiff<InvokerValues>) => Thenable<boolean>,
    destroyWebviewFn: () => any,
    context: InvokerContext
) {
    const outputChannel = context.outputChannel
    const fn = context.node
    outputChannel.show()

    switch (output.command) {
        case 'sampleRequestSelected':
            const sampleUrl = `${sampleRequestPath}${output.values.template}`

            const sample = (await new HttpResourceFetcher(sampleUrl).get()) ?? ''

            postMessageFn({
                values: {
                    payload: sample
                },
                inactiveFields: {
                    remove: ['payload', 'template']
                },
                loadingFields: {
                    remove: ['payload']
                },
                invalidFields: {
                    remove: ['payload']
                }
            })

            return

        case 'invokeLambda':
            outputChannel.appendLine('Loading response...')
            try {
                if (!fn.configuration.FunctionArn) {
                    throw new Error(`Could not determine ARN for function ${fn.configuration.FunctionName}`)
                }
                const client: LambdaClient = ext.toolkitClientBuilder.createLambdaClient(fn.regionCode)
                const funcResponse = await client.invoke(fn.configuration.FunctionArn, output.values.payload)
                const logs = funcResponse.LogResult ? Buffer.from(funcResponse.LogResult, 'base64').toString() : ''
                const payload = funcResponse.Payload ? funcResponse.Payload : JSON.stringify({})

                outputChannel.appendLine(`Invocation result for ${fn.configuration.FunctionArn}`)
                outputChannel.appendLine('Logs:')
                outputChannel.appendLine(logs)
                outputChannel.appendLine('')
                outputChannel.appendLine('Payload:')
                outputChannel.appendLine(payload.toString())
                outputChannel.appendLine('')
            } catch (e) {
                const error = e as Error
                outputChannel.appendLine(`There was an error invoking ${fn.configuration.FunctionArn}`)
                outputChannel.appendLine(error.toString())
                outputChannel.appendLine('')
            }

            return
    }
}

async function recordNumberOfActiveRegionsMetric(awsExplorer: AwsExplorer) {
    const numOfActiveRegions = awsExplorer.getRegionNodesSize()
    const currTime = new Date()

    ext.telemetry.record({
        createTime: currTime,
        data: [{ MetricName: 'vscode_activeregions', Value: numOfActiveRegions, Unit: 'Count' }]
    })
}

function updateAwsExplorerWhenAwsContextCredentialsChange(
    awsExplorer: AwsExplorer,
    awsContext: AwsContext,
    extensionContext: vscode.ExtensionContext
) {
    extensionContext.subscriptions.push(
        awsContext.onDidChangeContext(async credentialsChangedEvent => {
            getLogger().verbose(`Credentials changed (${credentialsChangedEvent.profileName}), updating AWS Explorer`)
            awsExplorer.refresh()

            if (credentialsChangedEvent.profileName) {
                await checkExplorerForDefaultRegion(credentialsChangedEvent.profileName, awsContext, awsExplorer)
            }
        })
    )
}

function makeSampleRequestManifestResourceFetcher(templatePath: string = ''): ResourceFetcher {
    return new CompositeResourceFetcher(
        new HttpResourceFetcher(`${sampleRequestManifestPath}${templatePath}`),
        new FileResourceFetcher(ext.manifestPaths.lambdaSampleRequests)
    )
}
