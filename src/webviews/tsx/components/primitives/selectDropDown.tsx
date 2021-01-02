/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { PrimitiveProps, SelectOption } from '../../interfaces/common'
import { generateClassString } from './common'

export interface SelectDropDownProps<Values> extends PrimitiveProps {
    options: SelectOption[]
    value: string
    name: keyof Values
    placeholder?: string
    setState(key: keyof Values, value: string, callback?: () => void): void
    onSelectAction?(): void
}

export const DEFAULT_PLACEHOLDER = 'aws-toolkit-vscode-react-DEFAULTPLACEHOLDER'

export function SelectDropDown<Values>(props: SelectDropDownProps<Values>) {
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

function onSelect<Values>(event: React.ChangeEvent<HTMLSelectElement>, props: SelectDropDownProps<Values>) {
    const target = event.target
    // TODO: React won't let me disable the placeholder and have it initially selected. If you know how to do this, we can remove this line!
    if (target.value !== DEFAULT_PLACEHOLDER) {
        props.setState(props.name, target.value, () => {
            if (props.onSelectAction) {
                props.onSelectAction()
            }
        })
    }
}
