/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schemas } from 'aws-sdk'
import * as vscode from 'vscode'
import { SchemaClient } from '../shared/clients/schemaClient'
import {getLocalizedText, LOCALIZEDIDS} from '../shared/localizedIds'

export async function* listRegistryItems(client: SchemaClient): AsyncIterableIterator<Schemas.RegistrySummary> {
    const status = vscode.window.setStatusBarMessage(
        getLocalizedText(LOCALIZEDIDS.Message.StatusBar.Loading.Registries)
    )

    try {
        yield* client.listRegistries()
    } finally {
        status.dispose()
    }
}

export async function* listSchemaItems(
    client: SchemaClient,
    registryName: string
): AsyncIterableIterator<Schemas.SchemaSummary> {
    const status = vscode.window.setStatusBarMessage(
        getLocalizedText(LOCALIZEDIDS.Message.StatusBar.Loading.SchemaItems)
    )

    try {
        yield* client.listSchemas(registryName)
    } finally {
        status.dispose()
    }
}

export async function* searchSchemas(
    client: SchemaClient,
    keyword: string,
    registryName: string
): AsyncIterableIterator<Schemas.SearchSchemaSummary> {
    const status = vscode.window.setStatusBarMessage(
        getLocalizedText(LOCALIZEDIDS.Message.StatusBar.SearchingSchemas)
    )

    try {
        yield* client.searchSchemas(keyword, registryName)
    } finally {
        status.dispose()
    }
}
