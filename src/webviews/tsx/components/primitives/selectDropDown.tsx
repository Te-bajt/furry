/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { generateClassString, SelectOption, SubComponentProps } from '../../interfaces/common'

export interface SelectDropDownProps extends SubComponentProps {
    options: SelectOption[]
    value: string
    name: string
    placeholder: string
    setState(key: string, value: string, callback?: () => void): void
    onSelectAction?(): void
}

export const DEFAULT_PLACEHOLDER = 'aws-toolkit-vscode-react-DEFAULTPLACEHOLDER'

export class SelectDropDown extends React.Component<SelectDropDownProps, {}> {
    public constructor(props: SelectDropDownProps) {
        super(props)
        this.props.setState(name, DEFAULT_PLACEHOLDER)
    }

    public render() {
        const options: JSX.Element[] = []

        options.push(
            <option value={DEFAULT_PLACEHOLDER} key={DEFAULT_PLACEHOLDER}>
                {this.props.placeholder}
            </option>
        )

        for (const option of this.props.options) {
            options.push(
                <option key={option.value} value={option.value}>
                    {option.displayName}
                </option>
            )
        }

        return (
            <select
                name={this.props.name}
                value={this.props.value}
                onChange={e => this.onSelect(e)}
                className={generateClassString(this.props)}
            >
                {options}
            </select>
        )
    }

    private onSelect(event: React.ChangeEvent<HTMLSelectElement>) {
        const target = event.target
        // TODO: React won't let me disable the placeholder and have it initially selected. If you know how to do this, we can remove this line!
        if (target.value !== DEFAULT_PLACEHOLDER) {
            this.props.setState(target.name, target.value, this.props.onSelectAction)
        }
    }
}

export function NewSelectDropDown(props: SelectDropDownProps) {
    props.setState(name, DEFAULT_PLACEHOLDER)
    const options: JSX.Element[] = []

    options.push(
        <option value={DEFAULT_PLACEHOLDER} key={DEFAULT_PLACEHOLDER}>
            {props.placeholder}
        </option>
    )

    for (const option of props.options) {
        options.push(
            <option key={option.value} value={option.value}>
                {option.displayName}
            </option>
        )
    }

    return (
        <select
            name={props.name}
            value={props.value}
            onChange={event => onSelect(event, props)}
            className={generateClassString(props)}
        >
            {options}
        </select>
    )
}

function onSelect(event: React.ChangeEvent<HTMLSelectElement>, props: SelectDropDownProps) {
    const target = event.target
    // TODO: React won't let me disable the placeholder and have it initially selected. If you know how to do this, we can remove this line!
    if (target.value !== DEFAULT_PLACEHOLDER) {
        props.setState(target.name, target.value, () => {
            if (props.onSelectAction) {
                props.onSelectAction()
            }
        })
    }
}
