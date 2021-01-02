/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { AwsComponentState } from '../interfaces/common'
import { GenericActions } from './awsReducerFunctions'
import { TextArea } from './primitives/textArea'

export interface JsonTextInputProps<Values, Commands> {
    name: keyof Values
    value: string
    placeholder: string
    state: AwsComponentState<Values>
    dispatch: React.Dispatch<GenericActions<Values, Commands>>
    rows?: number
    cols?: number
    isInvalidMessage?: string
    onChangeAction?(target: HTMLTextAreaElement): void
    onBlurAction?(target: HTMLTextAreaElement): void
}

export function JsonTextInput<Values, Commands>(props: JsonTextInputProps<Values, Commands>) {
    return (
        <div>
            <TextArea<Values, Commands>
                name={props.name}
                value={props.value}
                placeholder={props.placeholder}
                rows={props.rows}
                cols={props.cols}
                dispatch={props.dispatch}
                isHidden={props.state.statusFields.hiddenFields.has(props.name)}
                isInactive={props.state.statusFields.inactiveFields.has(props.name)}
                isInvalid={props.state.statusFields.invalidFields.has(props.name)}
                isLoading={props.state.statusFields.loadingFields.has(props.name)}
                onBlurAction={target => validateJsonOnBlur(target, props)}
            />
            {props.state.statusFields.invalidFields.has(props.name) ? <p>{props.isInvalidMessage}</p> : undefined}
        </div>
    )
}

function validateJsonOnBlur<Values, Commands>(
    target: HTMLTextAreaElement,
    props: JsonTextInputProps<Values, Commands>
) {
    try {
        JSON.parse(target.value)
        props.dispatch({
            type: 'updateState',
            message: {
                invalidFields: {
                    remove: [props.name]
                }
            }
        })
    } catch {
        props.dispatch({
            type: 'updateState',
            message: {
                invalidFields: {
                    add: [props.name]
                }
            }
        })
    }
}
