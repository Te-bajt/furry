/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path'
import * as vscode from 'vscode'
import { ExtensionUtilities } from '../shared/extensionUtilities'
import { AwsComponentToBackendMessage, ReactStateDiff } from './tsx/interfaces/common'

/**
 * Params for creating a React webview.
 *
 * TODO: Implement persistSessions
 * TODO: Implement persistWithoutFocus
 *
 * @param id: Webview's ID
 * @param name: Display name for webview
 * @param webviewJs: JS file representing entrypoint into webview. Outputted by the frontend webpack (via `webpack.webview.config.js`)
 * @param context: VS Code extension context
 * @param initialState: Initial state to message into the webview on initial load (does not message in when restoring webview)
 * @param persistSessions: (OPTIONAL) Persists the webview after restarting IDE. TODO: Implement this
 * @param persistWithoutFocus: (OPTIONAL) Persists webview after it loses focus without having to reload from scratch.
 * @param onDidReceiveMessageFunction: Function triggered when webview sends a request to the backend. Includes the message, a function to respond to the webview, and a function to destroy the webview.
 * @param onDidDisposeFunction: (OPTIONAL) Function triggered after the webview has been destroyed.
 */
export interface reactWebviewParams<Values, Commands> {
    id: string
    name: string
    webviewJs: string
    context: vscode.ExtensionContext
    initialState?: ReactStateDiff<Values>
    persistSessions?: boolean
    persistWithoutFocus?: boolean
    onDidReceiveMessageFunction(
        request: AwsComponentToBackendMessage<Values, Commands>,
        postMessageFn: (response: ReactStateDiff<Values>) => Thenable<boolean>,
        destroyWebviewFn: () => any
    ): void
    onDidDisposeFunction?(): void
}

/**
 * Creates a React webview with preloaded React libraries and CSS.
 * Handles onDidReceiveMessage and onDidDispose events (functions sent via params)
 *
 * @param params reactWebviewParameters
 */
export async function createReactWebview<Values, Commands>(params: reactWebviewParams<Values, Commands>) {
    const libsPath: string = path.join(params.context.extensionPath, 'media', 'libs')
    const jsPath: string = path.join(params.context.extensionPath, 'media', 'js')
    const cssPath: string = path.join(params.context.extensionPath, 'media', 'css')
    const webviewPath: string = path.join(params.context.extensionPath, 'compiledWebviews')

    const view = vscode.window.createWebviewPanel(params.id, params.name, vscode.ViewColumn.Beside, {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.file(libsPath),
            vscode.Uri.file(jsPath),
            vscode.Uri.file(cssPath),
            vscode.Uri.file(webviewPath)
        ],
        retainContextWhenHidden: params.persistWithoutFocus
    })

    const loadLibs = ExtensionUtilities.getFilesAsVsCodeResources(
        libsPath,
        ['react.development.js', 'react-dom.development.js'],
        view.webview
    ).concat(ExtensionUtilities.getFilesAsVsCodeResources(jsPath, ['loadVsCodeApi.js'], view.webview))

    let scripts: String = ''

    loadLibs.forEach(element => {
        scripts = scripts.concat(`<script src="${element}"></script>\n\n`)
    })

    const mainScript: vscode.Uri = view.webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, params.webviewJs)))

    view.title = params.name
    view.webview.html = `<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta
            http-equiv="Content-Security-Policy"
            content=
                "default-src 'none';
                img-src ${view.webview.cspSource} https:;
                script-src ${view.webview.cspSource};
                style-src ${view.webview.cspSource};
                font-src 'self' data:;"
        >
    </head>
    <body>
        <div id="reactApp"></div>
        <!-- Dependencies -->
        ${scripts}

        <!-- Main -->
        <script src="${mainScript}"></script>
    </body>
</html>`

    // message in initial state since we don't have access to the ReactDOM call at this level (since we webpack separately).
    // TODO: Is there a better way to do this?
    if (params.initialState) {
        view.webview.postMessage(params.initialState)
    }

    view.webview.onDidReceiveMessage(
        (message: AwsComponentToBackendMessage<Values, Commands>) => {
            params.onDidReceiveMessageFunction(
                message,
                response => view.webview.postMessage(response),
                // tslint:disable-next-line: no-unsafe-any
                () => view.dispose()
            )
        },
        undefined,
        params.context.subscriptions
    )

    view.onDidDispose(
        () => {
            if (params.onDidDisposeFunction) {
                params.onDidDisposeFunction()
            }
        },
        undefined,
        params.context.subscriptions
    )
}
