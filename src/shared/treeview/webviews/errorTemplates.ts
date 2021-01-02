/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getLocalizedText, LOCALIZEDIDS } from '../../../shared/localizedIds'

export class ErrorTemplates {
    public static readonly SHOW_ERROR_DETAILS = `
    <h1>
        ${getLocalizedText(LOCALIZEDIDS.TemplateError.ShowErrorDetails.Title)} <%= parent.label %>
    </h1>
    <p>

    <h2>
        ${getLocalizedText(LOCALIZEDIDS.TemplateError.ShowErrorDetails.ErrorCode)}
    </h2>
    <pre>
        <%= error.code %>
    </pre>

    <h2>
        ${getLocalizedText(LOCALIZEDIDS.TemplateError.ShowErrorDetails.ErrorMessage)}
    </h2>
    <pre>
        <%= error.message %>
    </pre>
    `
}
