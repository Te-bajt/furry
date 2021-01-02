/*!
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { PrimitiveProps } from '../../interfaces/common'
import { generateClassString } from './common'

export interface InputProps<Values> extends PrimitiveProps {
    value: string | number
    name: keyof Values
    placeholder?: string
    setState(key: string, value: string | number, callback?: () => void): void
    onChangeAction?(): void
}

export function Input<Values>(props: InputProps<Values>) {
    return (
        <input
            name={props.name.toString()}
            placeholder={props.placeholder}
            value={props.value}
            onChange={event => updateParentStateAndCallback(event, props)}
            className={generateClassString(props)}
        />
    )
}

function updateParentStateAndCallback<Values>(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    props: InputProps<Values>
) {
    const target = event.target
    props.setState(target.name, target.value, () => {
        if (props.onChangeAction) {
            props.onChangeAction()
        }
    })
}
