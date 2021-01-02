/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as vscode from 'vscode'
import * as nls from 'vscode-nls'
import { getLocalizedText, LocalizationString } from '../../shared/localizedIds'
import { getLogger, Loggable, Logger, LogLevel } from '../logger'

// TODO: Consider NLS initialization/configuration here & have packages to import localize from here
export const localize = nls.loadMessageBundle()

export interface TemplateParams {
    localizedString: LocalizationString
    templateTokens?: Loggable[]
}

export interface TemplateParser {
    (nlsKey: string, nlsTemplate: string, ...templateTokens: Loggable[]): string
}

export interface TemplateHandler {
    (localizedString: LocalizationString, ...templateTokens: Loggable[]): void
}

export function processTemplate<T extends TemplateParams>({
    localizedString,
    templateTokens = []
}: T): { errors: Error[]; prettyMessage: string } {
    const prettyTokens: Exclude<Loggable, Error>[] = []
    const errors: Error[] = []
    if (templateTokens) {
        templateTokens.forEach(token => {
            if (token instanceof Error) {
                prettyTokens.push(token.message)
                errors.push(token)
            } else {
                prettyTokens.push(token)
            }
        })
    }
    const prettyMessage = getLocalizedText(localizedString, ...prettyTokens)

    return {
        errors,
        prettyMessage
    }
}

export interface ChannelLogger {
    readonly channel: vscode.OutputChannel
    readonly logger: Logger
    verbose: TemplateHandler
    debug: TemplateHandler
    info: TemplateHandler
    warn: TemplateHandler
    error: TemplateHandler
}

/**
 * Wrapper around normal logger that writes to output channel and normal logs.
 * Avoids making two log statements when writing to output channel and improves consistency
 */
export function getChannelLogger(channel: vscode.OutputChannel, logger: Logger = getLogger()): ChannelLogger {
    function log({ localizedString, templateTokens, level }: TemplateParams & { level: LogLevel }): void {
        if (level === 'error') {
            channel.show(true)
        }
        const { prettyMessage, errors } = processTemplate({ localizedString, templateTokens })
        channel.appendLine(prettyMessage)
        // TODO: Log in english if/when we get multi lang support
        // Log pretty message then Error objects (so logger might show stack traces)
        logger[level](...[prettyMessage, ...errors])
    }

    return Object.freeze({
        channel,
        logger,
        verbose: (localizedString: LocalizationString, ...templateTokens: Loggable[]) =>
            log({
                level: 'verbose',
                localizedString,
                templateTokens
            }),
        debug: (localizedString: LocalizationString, ...templateTokens: Loggable[]) =>
            log({
                level: 'debug',
                localizedString,
                templateTokens
            }),
        info: (localizedString: LocalizationString, ...templateTokens: Loggable[]) =>
            log({
                level: 'info',
                localizedString,
                templateTokens
            }),
        warn: (localizedString: LocalizationString, ...templateTokens: Loggable[]) =>
            log({
                level: 'warn',
                localizedString,
                templateTokens
            }),
        error: (localizedString: LocalizationString, ...templateTokens: Loggable[]) =>
            log({
                level: 'error',
                localizedString,
                templateTokens
            })
    })
}

export async function getDebugPort(): Promise<number> {
    // TODO: Find available port
    return 5858
}
