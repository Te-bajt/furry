/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { samLambdaRuntimes } from '../../lambda/models/samLambdaRuntime'
import { createStatusFields } from './components/awsComponent'
import { AwsComponentProps, AwsComponentState, SelectOption, VsCode } from './interfaces/common'
import { CreateSamAppCommands, CreateSamAppValues } from './interfaces/createSamApp'
import { defaultMountEffect, defaultReducer, GenericActions } from './reducerComponents/awsReducerFunctions'
import { DirectoryPicker } from './reducerComponents/directoryPicker'
import { Button } from './reducerComponents/primitives/button'
import { Input } from './reducerComponents/primitives/input'
import { SelectDropDown } from './reducerComponents/primitives/selectDropDown'

declare const vscode: VsCode<CreateSamAppValues, CreateSamAppCommands>

const initialState: AwsComponentState<CreateSamAppValues> = {
    values: {
        appName: '',
        directory: '',
        runtime: ''
    },
    statusFields: createStatusFields<CreateSamAppValues>()
}

// Add any non-standard actions here; type them to extend BaseAction, and add as a type to the action.
// Make sure all actions not covered in the GenericActions are included in the switch statement
function reducer(
    prevState: AwsComponentState<CreateSamAppValues>,
    action: GenericActions<CreateSamAppValues, CreateSamAppCommands>
): AwsComponentState<CreateSamAppValues> {
    switch (action.type) {
        default:
            return defaultReducer(prevState, action, vscode)
    }
}

export function CreateSamApp(props: AwsComponentProps<CreateSamAppValues, CreateSamAppCommands>) {
    // Initialize reducer using a reducer function (that should at the very least call the defaultReducer) and an initial state
    // Include this in every top-level component
    const [state, dispatch] = React.useReducer(reducer, initialState)

    // Boilerplate command to check for initial state from VS Code API and set up listeners
    // Only run on mount
    // Include this in every top-level component.
    React.useEffect(() => {
        defaultMountEffect(dispatch, initialState, vscode)
    }, [])

    const options: SelectOption[] = []
    samLambdaRuntimes.forEach(value => {
        options.push({
            displayName: value,
            value: value
        })
    })

    return (
        <div>
            <h1>Create New SAM Application</h1>
            <p>Application Name: </p>
            <Input<CreateSamAppValues, CreateSamAppCommands>
                name="appName"
                value={state.values.appName}
                dispatch={dispatch}
            />
            <p>Runtime:</p>
            <SelectDropDown<CreateSamAppValues, CreateSamAppCommands>
                name="runtime"
                value={state.values.runtime}
                options={options}
                placeholder="Runtimes"
                dispatch={dispatch}
            />
            <p>Location: </p>
            <DirectoryPicker<CreateSamAppValues, CreateSamAppCommands>
                name="directory"
                value={state.values.directory}
                text="Choose Directory"
                command="selectDirectory"
                dispatch={dispatch}
                state={state}
            />
            <Button
                onClick={() => onSubmit(dispatch)}
                text="Create SAM Application"
                isInactive={isButtonInactive(state)}
            />
        </div>
    )
}

function onSubmit(dispatch: React.Dispatch<GenericActions<CreateSamAppValues, CreateSamAppCommands>>) {
    dispatch({
        type: 'sendCommand',
        command: 'createSamApp'
    })
}

function isButtonInactive(state: AwsComponentState<CreateSamAppValues>): boolean {
    return (
        state.values.appName === '' ||
        state.values.directory === '' ||
        state.values.runtime === '' ||
        state.statusFields.invalidFields.size > 0 ||
        state.statusFields.loadingFields.size > 0
    )
}

ReactDOM.render(<CreateSamApp vscode={vscode} defaultState={initialState} />, document.getElementById('reactApp'))
