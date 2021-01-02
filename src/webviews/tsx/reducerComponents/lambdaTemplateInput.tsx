/*!
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { AwsComponentState, SelectOption } from '../interfaces/common'
import { GenericActions } from './awsReducerFunctions'
import { JsonTextInput } from './jsonTextInput'
import { SelectDropDown } from './primitives/selectDropDown'

const DEFAULT_ROWS: number = 20
const DEFAULT_COLS: number = 75

export interface LambdaTemplateInputProps<Values, Commands> {
    templateOptions: SelectOption[]
    templateName: keyof Values
    templateValue: string
    jsonName: keyof Values
    jsonValue: string
    onChangeCommand: Commands
    state: AwsComponentState<Values>
    dispatch: React.Dispatch<GenericActions<Values, Commands>>
    jsonRows?: number
    jsonCols?: number
    invalidJsonMessage?: string
}

export function LambdaTemplateInput<Values, Commands>(props: LambdaTemplateInputProps<Values, Commands>) {
    return (
        <div>
            <h3>Enter a JSON payload (or select a template from the list below)</h3>
            <SelectDropDown<Values, Commands>
                name={props.templateName}
                value={props.templateValue}
                placeholder="Templates"
                options={props.templateOptions}
                onSelectAction={() => onSelectTemplate(props)}
                dispatch={props.dispatch}
                isHidden={props.state.statusFields.hiddenFields.has(props.templateName)}
                isInactive={props.state.statusFields.inactiveFields.has(props.templateName)}
                isInvalid={props.state.statusFields.invalidFields.has(props.templateName)}
                isLoading={props.state.statusFields.loadingFields.has(props.templateName)}
            />
            <br />
            <h3>JSON Payload</h3>
            <JsonTextInput<Values, Commands>
                name={props.jsonName}
                value={props.jsonValue}
                placeholder="JSON Payload"
                rows={props.jsonRows || DEFAULT_ROWS}
                cols={props.jsonCols || DEFAULT_COLS}
                isInvalidMessage={props.invalidJsonMessage}
                dispatch={props.dispatch}
                state={props.state}
            />
        </div>
    )
}

function onSelectTemplate<Values, Commands>(props: LambdaTemplateInputProps<Values, Commands>) {
    props.dispatch({
        type: 'updateState',
        message: {
            inactiveFields: {
                add: [props.templateName, props.jsonName]
            },
            loadingFields: {
                add: [props.jsonName]
            }
        }
    })
    props.dispatch({
        type: 'sendCommand',
        command: props.onChangeCommand
    })
}
