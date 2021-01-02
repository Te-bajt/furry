/*!
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { PrimitiveProps } from '../../interfaces/common'
import { createPartialValues, GenericActions } from '../awsReducerFunctions'
import { generateClassString } from './common'

export interface InputProps<Values, Commands> extends PrimitiveProps {
    value: string | number
    name: keyof Values
    dispatch: React.Dispatch<GenericActions<Values, Commands>>
    placeholder?: string
    onChangeAction?(): void
}

export function Input<Values, Commands>(props: InputProps<Values, Commands>) {
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

function updateParentStateAndCallback<Values, Commands>(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    props: InputProps<Values, Commands>
) {
    const target = event.target
    props.dispatch({
        type: 'updateState',
        message: {
            values: createPartialValues(props.name, target.value)
        }
    })
    if (props.onChangeAction) {
        props.onChangeAction()
    }
}
