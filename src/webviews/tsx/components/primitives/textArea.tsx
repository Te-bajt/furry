/*!
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { generateClassString, SubComponentProps } from '../../interfaces/common'

export interface TextAreaProps extends SubComponentProps {
    value: string | number
    name: string
    placeholder: string
    rows?: number
    cols?: number
    setState(key: string, value: string | number, callback?: () => void): void
    onChangeAction?(): void
}

export function TextArea(props: TextAreaProps) {
    return (
        <textarea
            name={props.name}
            placeholder={props.placeholder}
            value={props.value}
            onChange={event => updateParentStateAndCallback(event, props)}
            className={generateClassString(props)}
            rows={props.rows}
            cols={props.cols}
        />
    )
}

function updateParentStateAndCallback(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    props: TextAreaProps
) {
    const target = event.target
    props.setState(target.name, target.value, () => {
        if (props.onChangeAction) {
            props.onChangeAction()
        }
    })
}
