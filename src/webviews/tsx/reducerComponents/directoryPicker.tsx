/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { AwsComponentState } from '../interfaces/common'
import { GenericActions } from './awsReducerFunctions'
import { Button } from './primitives/button'

export interface DirectoryPickerProps<Values, Commands> {
    name: keyof Values
    value: string
    text: string
    state: AwsComponentState<Values>
    dispatch: React.Dispatch<GenericActions<Values, Commands>>
    command: Commands
}

export function DirectoryPicker<Values, Commands>(props: DirectoryPickerProps<Values, Commands>) {
    return (
        <div>
            <Button
                onClick={() => askBackendForDirectory(props)}
                text={props.text}
                isInactive={
                    props.state.statusFields.invalidFields.has(name) || props.state.statusFields.loadingFields.has(name)
                }
            />
            {props.value !== '' ? `Selected Directory: ${props.value}` : undefined}
        </div>
    )
}

function askBackendForDirectory<Values, Commands>(props: DirectoryPickerProps<Values, Commands>) {
    props.dispatch({
        type: 'updateState',
        message: {
            loadingFields: {
                add: [props.name]
            }
        }
    })
    props.dispatch({
        type: 'sendCommand',
        command: props.command
    })
}
