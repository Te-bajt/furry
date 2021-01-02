/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { LocalizationString } from '../../../src/shared/localizedIds'
import { Loggable } from '../../shared/logger'
import { ChannelLogger } from '../../shared/utilities/vsCodeUtils'
import { MockOutputChannel } from '../mockOutputChannel'
import { TestLogger } from '../testLogger'

export class FakeChannelLogger implements ChannelLogger {
    public readonly loggedInfoKeys: Set<string> = new Set<string>()
    public readonly loggedErrorKeys: Set<string> = new Set<string>()
    public readonly loggedDebugKeys: Set<string> = new Set<string>()
    public readonly loggedWarnKeys: Set<string> = new Set<string>()
    public readonly loggedVerboseKeys: Set<string> = new Set<string>()
    public readonly logger: TestLogger = new TestLogger()

    public channel: vscode.OutputChannel = new MockOutputChannel()

    public info(localizedString: LocalizationString, ...templateTokens: Loggable[]): void {
        this.loggedInfoKeys.add(localizedString.id)
    }

    public error(localizedString: LocalizationString, ...templateTokens: Loggable[]): void {
        this.loggedErrorKeys.add(localizedString.id)
    }

    public debug(localizedString: LocalizationString, ...templateTokens: Loggable[]): void {
        this.loggedDebugKeys.add(localizedString.id)
    }

    public warn(localizedString: LocalizationString, ...templateTokens: Loggable[]): void {
        this.loggedWarnKeys.add(localizedString.id)
    }

    public verbose(localizedString: LocalizationString, ...templateTokens: Loggable[]): void {
        this.loggedVerboseKeys.add(localizedString.id)
    }
}
