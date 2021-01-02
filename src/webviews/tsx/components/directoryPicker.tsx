/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { SubComponentProps } from '../interfaces/common'
import { Button } from './primitives/button'

export interface DirectoryPickerProps<Values, Commands> extends SubComponentProps<Values, Commands> {
    name: keyof Values
    value: string
    text: string
    command: Commands
}

export function DirectoryPicker<Values, Commands>(props: DirectoryPickerProps<Values, Commands>) {
    return (
        <div>
            <Button
                onClick={() => askBackendForDirectory(props)}
                text={props.text}
                isInactive={
                    props.stateInteractors.getStatusFromSet('invalidFields', name) ||
                    props.stateInteractors.getStatusFromSet('loadingFields', name)
                }
            />
            {props.value !== '' ? `Selected Directory: ${props.value}` : undefined}
        </div>
    )
}

function askBackendForDirectory<Values, Commands>(props: DirectoryPickerProps<Values, Commands>) {
    props.stateInteractors.setStatusInSet('loadingFields', props.name)
    props.stateInteractors.postMessageToVsCode(props.command)
}
