/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { SubComponentProps } from '../interfaces/common'
import { TextArea } from './primitives/textArea'

export interface JsonTextInputProps<Values, Commands> extends SubComponentProps<Values, Commands> {
    name: keyof Values
    value: string
    placeholder: string
    rows?: number
    cols?: number
    isInvalidMessage?: string
    onChangeAction?(target: HTMLTextAreaElement): void
    onBlurAction?(target: HTMLTextAreaElement): void
}

export function JsonTextInput<Values, Commands>(props: JsonTextInputProps<Values, Commands>) {
    return (
        <div>
            <TextArea<Values>
                name={props.name}
                value={props.value}
                placeholder={props.placeholder}
                rows={props.rows}
                cols={props.cols}
                isHidden={props.stateInteractors.getStatusFromSet('hiddenFields', props.name)}
                isInactive={props.stateInteractors.getStatusFromSet('inactiveFields', props.name)}
                isInvalid={props.stateInteractors.getStatusFromSet('invalidFields', props.name)}
                isLoading={props.stateInteractors.getStatusFromSet('loadingFields', props.name)}
                onBlurAction={target => validateJsonOnBlur(target, props)}
                setState={(key: keyof Values, value: string, callback: () => void) =>
                    props.stateInteractors.setSingleState(key, value, callback)
                }
            />
            {props.stateInteractors.getStatusFromSet('invalidFields', props.name) ? (
                <p>{props.isInvalidMessage}</p>
            ) : (
                undefined
            )}
        </div>
    )
}

function validateJsonOnBlur<Values, Commands>(
    target: HTMLTextAreaElement,
    props: JsonTextInputProps<Values, Commands>
) {
    try {
        JSON.parse(target.value)
        props.stateInteractors.removeStatusFromSet('invalidFields', props.name)
    } catch {
        props.stateInteractors.setStatusInSet('invalidFields', props.name)
    }
}
