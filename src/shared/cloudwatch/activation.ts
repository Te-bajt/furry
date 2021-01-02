/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'

export const CLOUDWATCH_LOGS_SCHEME = 'awsCloudWatchLogs'

export async function activate(activateArguments: { extensionContext: vscode.ExtensionContext }): Promise<void> {
    const provider = CloudWatchLogsProvider.getCloudWatchLogsProvider()
    vscode.workspace.registerTextDocumentContentProvider(CLOUDWATCH_LOGS_SCHEME, provider)

    vscode.commands.registerCommand('aws.openLog', async () => {
        let what = await vscode.window.showInputBox({ placeHolder: 'what should this log be named' })
        if (what) {
            let uri = vscode.Uri.parse(`${CLOUDWATCH_LOGS_SCHEME}:` + what)
            let doc = await vscode.workspace.openTextDocument(uri) // calls back into the provider
            await vscode.window.showTextDocument(doc, { preview: false })
        }
    })

    // this can only be called from a button in the editor pane. activeTextEditor should always be accurate
    vscode.commands.registerCommand('aws.tailLog', async () => {
        await addLogs('tail')
    })

    // this can only be called from a button in the editor pane. activeTextEditor should always be accurate
    vscode.commands.registerCommand('aws.loadOlderLogs', async () => {
        await addLogs('head')
    })
}

async function addLogs(headOrTail: 'head' | 'tail'): Promise<void> {
    if (!vscode.window.activeTextEditor) {
        return // no editor
    }
    const editor = vscode.window.activeTextEditor
    const document = editor.document
    if (document.uri.scheme !== CLOUDWATCH_LOGS_SCHEME) {
        return // not my scheme
    }

    const registry = CloudWatchLogsProvider.getCloudWatchLogsProvider()
    const lorem = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis varius quam quisque id diam vel quam. Lorem ipsum dolor sit amet. Sed odio morbi quis commodo. Aliquam faucibus purus in massa tempor. Nec feugiat in fermentum posuere urna nec tincidunt praesent semper. Ut faucibus pulvinar elementum integer enim neque. Tortor aliquam nulla facilisi cras fermentum odio eu feugiat. Integer quis auctor elit sed vulputate mi sit amet. Pretium quam vulputate dignissim suspendisse in est ante in nibh. Morbi tempus iaculis urna id volutpat lacus laoreet. Eu turpis egestas pretium aenean. Mattis nunc sed blandit libero volutpat sed cras ornare. Faucibus a pellentesque sit amet porttitor eget.',
        'Lacus vestibulum sed arcu non odio euismod. Imperdiet massa tincidunt nunc pulvinar sapien. Accumsan lacus vel facilisis volutpat est velit egestas. Orci porta non pulvinar neque. Netus et malesuada fames ac turpis egestas maecenas. Nibh cras pulvinar mattis nunc sed blandit. Lobortis elementum nibh tellus molestie nunc non blandit. Penatibus et magnis dis parturient montes nascetur ridiculus. Posuere lorem ipsum dolor sit amet consectetur adipiscing. Aenean et tortor at risus viverra adipiscing at in tellus. Eu non diam phasellus vestibulum lorem sed. Ut etiam sit amet nisl purus in mollis nunc. Vestibulum sed arcu non odio euismod lacinia at quis risus. Vel turpis nunc eget lorem dolor. Diam maecenas ultricies mi eget mauris pharetra et ultrices neque. In aliquam sem fringilla ut morbi tincidunt augue interdum. Curabitur gravida arcu ac tortor dignissim.',
        'Ultrices sagittis orci a scelerisque purus semper. Viverra nibh cras pulvinar mattis nunc sed blandit libero volutpat. At tempor commodo ullamcorper a lacus vestibulum sed arcu. Rutrum quisque non tellus orci ac auctor. Id aliquet lectus proin nibh nisl. Vitae justo eget magna fermentum iaculis eu non diam phasellus. Arcu dui vivamus arcu felis bibendum. Sapien et ligula ullamcorper malesuada proin libero nunc consequat. Pellentesque dignissim enim sit amet venenatis. Praesent tristique magna sit amet purus. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Tempor nec feugiat nisl pretium fusce id velit ut tortor. At tempor commodo ullamcorper a lacus vestibulum sed arcu non. Amet nisl purus in mollis nunc sed id.',
        'Interdum velit laoreet id donec ultrices. Non odio euismod lacinia at quis risus sed. Cursus vitae congue mauris rhoncus aenean vel elit scelerisque mauris. Nibh nisl condimentum id venenatis. Dolor sit amet consectetur adipiscing elit ut. Egestas maecenas pharetra convallis posuere morbi. Ac tortor dignissim convallis aenean et tortor at. Purus in mollis nunc sed. Mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare massa. Eget arcu dictum varius duis at consectetur. Posuere urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Facilisis volutpat est velit egestas dui id ornare arcu. Laoreet id donec ultrices tincidunt arcu non. Metus aliquam eleifend mi in nulla posuere sollicitudin. Tortor dignissim convallis aenean et. Eget nunc scelerisque viverra mauris in aliquam. Mollis nunc sed id semper. Egestas erat imperdiet sed euismod nisi porta.',
        'Nisl purus in mollis nunc sed id semper risus in. Fermentum leo vel orci porta non pulvinar neque laoreet. Purus non enim praesent elementum facilisis leo. Eget felis eget nunc lobortis. Enim diam vulputate ut pharetra sit amet aliquam. Sed lectus vestibulum mattis ullamcorper. Sapien faucibus et molestie ac feugiat. Faucibus purus in massa tempor. Vestibulum sed arcu non odio euismod lacinia at quis. Risus sed vulputate odio ut enim blandit volutpat maecenas volutpat. Faucibus turpis in eu mi. Et malesuada fames ac turpis. Justo laoreet sit amet cursus sit amet dictum sit amet. Vulputate sapien nec sagittis aliquam malesuada bibendum.',
    ]

    const currRange = editor.visibleRanges
    const linesToAdd = randomInt(20)
    for (let i = 0; i < linesToAdd; i++) {
        registry.updateLogContent(document.uri, lorem[randomInt(5)], headOrTail)
    }
    if (headOrTail === 'head') {
        editor.revealRange(
            new vscode.Range(currRange[0].start.line + linesToAdd, 0, currRange[0].end.line + linesToAdd, 0),
            vscode.TextEditorRevealType.AtTop
        )
    } else {
        editor.revealRange(
            new vscode.Range(document.lineCount - 1 + linesToAdd, 0, document.lineCount - 1 + linesToAdd, 0),
            vscode.TextEditorRevealType.InCenter
        )
    }
}

function randomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max))
}

class CloudWatchLogsProvider implements vscode.TextDocumentContentProvider {
    // Expose an event to signal changes of _virtual_ documents
    // to the editor
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>()
    public get onDidChange() {
        return this._onDidChange.event
    }
    public provideTextDocumentContent(uri: vscode.Uri): string {
        // if not in updater, add to updater and have updater pull current content
        const registry = CloudWatchLogsProvider.getCloudWatchLogsProvider()
        if (!registry.hasLog(uri)) {
            registry.addLog(uri)
        }
        // get latest content and return
        return registry.getLogContent(uri) ?? ''
    }

    // registry stuff

    private static INSTANCE: CloudWatchLogsProvider | undefined
    private readonly activeStreams: Map<string, CloudWatchLogStream>
    public constructor() {
        this.activeStreams = new Map<string, CloudWatchLogStream>()
    }

    public hasLog(uri: vscode.Uri): boolean {
        return this.activeStreams.has(uri.path)
    }

    // initial seed for editor content
    public async addLog(uri: vscode.Uri): Promise<void> {
        // TODO: Make call and add contents
        this.setLog(uri, {
            isTail: false,
            focusedLine: 0,
            content: uri.toString(),
        })
    }

    private setLog(uri: vscode.Uri, stream: CloudWatchLogStream) {
        this.activeStreams.set(uri.path, stream)
        this._onDidChange.fire(uri)
    }

    public getLogContent(uri: vscode.Uri): string | undefined {
        return this.activeStreams.get(uri.path)?.content
    }

    public async updateLogContent(uri: vscode.Uri, content: string, headsOrTails: 'head' | 'tail'): Promise<void> {
        const stream = this.activeStreams.get(uri.path)
        if (stream) {
            this.setLog(uri, {
                ...stream,
                content: headsOrTails === 'head' ? `${content}\n${stream.content}` : `${stream.content}\n${content}`,
            })
        }
    }

    /**
     * Returns the CloudFormationTemplateRegistry singleton.
     * If the singleton doesn't exist, creates it.
     */
    public static getCloudWatchLogsProvider(): CloudWatchLogsProvider {
        if (!CloudWatchLogsProvider.INSTANCE) {
            CloudWatchLogsProvider.INSTANCE = new CloudWatchLogsProvider()
        }

        return CloudWatchLogsProvider.INSTANCE
    }
}

interface CloudWatchLogStream {
    isTail: boolean
    focusedLine: number
    // do we need content here or can we rely on existing doc?
    content: string
    forwardToken?: string
    backwardToken?: string
}
