/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { createStatusFields } from './components/awsComponent'
import { AwsComponentProps, AwsComponentState, VsCode } from './interfaces/common'
import { InvokerCommands, InvokerValues } from './interfaces/invoker'
import { defaultMountEffect, defaultReducer, GenericActions } from './reducerComponents/awsReducerFunctions'
import { LambdaTemplateInput } from './reducerComponents/lambdaTemplateInput'
import { Button } from './reducerComponents/primitives/button'

declare const vscode: VsCode<InvokerValues, InvokerCommands>

const initialState: AwsComponentState<InvokerValues> = {
    values: {
        availableTemplates: [],
        lambda: '',
        payload: '',
        region: '',
        template: ''
    },
    statusFields: createStatusFields<InvokerValues>()
}

// Add any non-standard actions here; type them to extend BaseAction, and add as a type to the action.
// Make sure all actions not covered in the GenericActions are included in the switch statement
function reducer(
    prevState: AwsComponentState<InvokerValues>,
    action: GenericActions<InvokerValues, InvokerCommands>
): AwsComponentState<InvokerValues> {
    switch (action.type) {
        default:
            return defaultReducer(prevState, action, vscode)
    }
}

export function ReducerInvoker(props: AwsComponentProps<InvokerValues, InvokerCommands>) {
    // Initialize reducer using a reducer function (that should at the very least call the defaultReducer) and an initial state
    // Include this in every top-level component
    const [state, dispatch] = React.useReducer(reducer, initialState)

    // Boilerplate command to check for initial state from VS Code API and set up listeners
    // Only run on mount
    // Include this in every top-level component.
    React.useEffect(() => {
        defaultMountEffect(dispatch, initialState, vscode)
    }, [])

    const templateName = 'template'
    const jsonName = 'payload'

    return (
        <div>
            <h1>
                Calling Lambda function: {state.values.lambda} in Region: {state.values.region}
            </h1>
            <br />
            <LambdaTemplateInput<InvokerValues, InvokerCommands>
                templateName={templateName}
                jsonName={jsonName}
                templateValue={state.values.template}
                jsonValue={state.values.payload}
                templateOptions={state.values.availableTemplates}
                invalidJsonMessage="Payload is not valid JSON."
                onChangeCommand="sampleRequestSelected"
                state={state}
                dispatch={dispatch}
            />
            <br />
            <Button
                onClick={() => {
                    if (
                        !state.statusFields.invalidFields.has(jsonName) &&
                        !state.statusFields.loadingFields.has(jsonName)
                    ) {
                        dispatch({
                            type: 'sendCommand',
                            command: 'invokeLambda'
                        })
                    }
                }}
                text="Submit!"
            />
        </div>
    )
}

ReactDOM.render(<ReducerInvoker vscode={vscode} defaultState={initialState} />, document.getElementById('reactApp'))
