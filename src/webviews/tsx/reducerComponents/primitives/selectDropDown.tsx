/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { PrimitiveProps, SelectOption } from '../../interfaces/common'
import { createPartialValues, GenericActions } from '../awsReducerFunctions'
import { generateClassString } from './common'

export interface SelectDropDownProps<Values, Commands> extends PrimitiveProps {
    options: SelectOption[]
    value: string
    name: keyof Values
    dispatch: React.Dispatch<GenericActions<Values, Commands>>
    placeholder?: string
    onSelectAction?(): void
}

export const DEFAULT_PLACEHOLDER = 'aws-toolkit-vscode-react-DEFAULTPLACEHOLDER'

export function SelectDropDown<Values, Commands>(props: SelectDropDownProps<Values, Commands>) {
    const options: JSX.Element[] = []

    if (props.placeholder) {
        options.push(
            <option value={DEFAULT_PLACEHOLDER} key={DEFAULT_PLACEHOLDER}>
                ----{props.placeholder}----
            </option>
        )
    }

    for (const option of props.options) {
        options.push(
            <option value={option.value} key={option.value}>
                {option.displayName}
            </option>
        )
    }

    return (
        <select
            name={props.name.toString()}
            value={props.value}
            onChange={e => onSelect(e, props)}
            className={generateClassString(props)}
        >
            {options}
        </select>
    )
}

function onSelect<Values, Commands>(
    event: React.ChangeEvent<HTMLSelectElement>,
    props: SelectDropDownProps<Values, Commands>
) {
    const target = event.target
    // TODO: React won't let me disable the placeholder and have it initially selected. If you know how to do this, we can remove this line!
    if (target.value !== DEFAULT_PLACEHOLDER) {
        props.dispatch({
            type: 'updateState',
            message: {
                values: createPartialValues(props.name, target.value)
            }
        })
        if (props.onSelectAction) {
            props.onSelectAction()
        }
    }
}
