/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

import { getLocalizedText, LOCALIZEDIDS } from '../../shared/localizedIds'

export function makeCheckLogsMessage(): string {
    const commandName = getLocalizedText(LOCALIZEDIDS.Command.ViewLogs)
    const message = getLocalizedText(LOCALIZEDIDS.Error.CheckLogs, commandName)

    return message
}
