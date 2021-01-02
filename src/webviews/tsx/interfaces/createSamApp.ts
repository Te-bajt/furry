/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Runtime } from 'aws-sdk/clients/lambda'

export interface CreateSamAppValues {
    runtime: Runtime
    directory: string
    appName: string
}

export type CreateSamAppCommands = 'createSamApp' | 'selectDirectory'
