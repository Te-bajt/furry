/*!
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { PrimitiveProps } from '../../interfaces/common'
import { generateClassString } from './common'

export interface TextAreaProps<Values> extends PrimitiveProps {
    value: string
    name: keyof Values
    placeholder?: string
    rows?: number
    cols?: number
    setState(key: keyof Values, value: string, callback?: () => void): void
    onChangeAction?(target: HTMLTextAreaElement): void
    onBlurAction?(target: HTMLTextAreaElement): void
}

export function TextArea<Values>(props: TextAreaProps<Values>) {
    return (
        <textarea
            name={props.name.toString()}
            placeholder={props.placeholder}
            value={props.value}
            onChange={event => updateParentStateAndCallback(event, props)}
            className={generateClassString(props)}
            rows={props.rows}
            cols={props.cols}
            onBlur={event => onBlurAction(event, props)}
        />
    )
}

function updateParentStateAndCallback<Values>(
    event: React.ChangeEvent<HTMLTextAreaElement>,
    props: TextAreaProps<Values>
) {
    const target = event.target
    props.setState(props.name, target.value, () => {
        if (props.onChangeAction) {
            props.onChangeAction(event.target)
        }
    })
}

function onBlurAction<Values>(event: React.FocusEvent<HTMLTextAreaElement>, props: TextAreaProps<Values>) {
    if (props.onBlurAction) {
        props.onBlurAction(event.target)
    }
}
