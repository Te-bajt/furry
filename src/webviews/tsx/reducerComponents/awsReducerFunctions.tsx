/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    AwsComponentState,
    BackendAlteredFields,
    ReactStateDiff,
    StatusFields,
    VsCode,
    VsCodeRetainedState
} from '../interfaces/common'

export function defaultMountEffect<Values, Commands>(
    dispatch: React.Dispatch<UpdateReactStateAction<Values> | RestoreExistingStateAction<Values>>,
    defaultState: AwsComponentState<Values>,
    vscode: VsCode<Values, Commands>
): () => void {
    // check for VS Code persisted state
    dispatch({
        type: 'restoreExistingState',
        existingState: vscode.getState(),
        defaultState
    })

    // check for incoming default values. If this uses `reactLoader.ts`, this should only happen when the webview is initially launched.
    window.addEventListener('message', event =>
        dispatch({
            type: 'updateState',
            message: (event.data as any) as ReactStateDiff<Values>
        })
    )

    return function cleanupEventListener() {
        window.removeEventListener('message', event =>
            dispatch({
                type: 'updateState',
                message: (event.data as any) as ReactStateDiff<Values>
            })
        )
    }
}

export interface BaseAction {
    type: string
}

/**
 * Sends the state's full values to the backend along with a selected command
 */
interface SendCommandAction<Commands> extends BaseAction {
    type: 'sendCommand'
    command: Commands
}

/**
 * Handles initial state on webview reload
 */
interface RestoreExistingStateAction<Values> extends BaseAction {
    type: 'restoreExistingState'
    defaultState: AwsComponentState<Values>
    existingState: VsCodeRetainedState<Values> | undefined
}

/**
 * Handles messages posted from Node backend
 */
interface UpdateReactStateAction<Values> extends BaseAction {
    type: 'updateState'
    message: ReactStateDiff<Values>
}

export type GenericActions<Values, Commands> =
    | SendCommandAction<Commands>
    | UpdateReactStateAction<Values>
    | RestoreExistingStateAction<Values>

/**
 * A simple wrapper to create a partial values object in order to avoid the ugliness of `as any as Partial<Values`
 * In order to create a values object with more than one value modification, use the spread syntax:
 * ```
 * values: {
 *     ...createPartialValues(key1, values1),
 *     ...createPartialValues(key2, values2)
 * }
 * @param key key from a Values object
 * @param value: Value to add to object
 */
export function createPartialValues<Values>(key: keyof Values, value: any): Partial<Values> {
    return ({
        [key]: value
    } as any) as Partial<Values>
}

export function defaultReducer<Values, Commands>(
    prevState: AwsComponentState<Values>,
    action: GenericActions<Values, Commands>,
    vscode: VsCode<Values, Commands>
): AwsComponentState<Values> {
    // return previous state if action does not mutate state.
    let finalState: AwsComponentState<Values> = prevState

    switch (action.type) {
        // BEGIN COMPONENT STATE INTERACTION COMMANDS
        // handles incoming messages from Node backend (from UpdateReactStateAction)
        case 'updateState':
            const updatedStatusFields: StatusFields<Values> = {
                inactiveFields: handleBackendAlteredFields(
                    prevState.statusFields.inactiveFields,
                    action.message.inactiveFields
                ),
                invalidFields: handleBackendAlteredFields(
                    prevState.statusFields.invalidFields,
                    action.message.invalidFields
                ),
                hiddenFields: handleBackendAlteredFields(
                    prevState.statusFields.hiddenFields,
                    action.message.hiddenFields
                ),
                loadingFields: handleBackendAlteredFields(
                    prevState.statusFields.loadingFields,
                    action.message.loadingFields
                )
            }
            finalState = {
                values: {
                    ...prevState.values,
                    ...action.message.values
                },
                statusFields: updatedStatusFields
            }
            break
        // sends an arbitrary command to Node backend, along with all values (from SendCommandAction)
        case 'sendCommand':
            vscode.postMessage({
                command: action.command,
                values: prevState.values
            })
            break

        // END USER COMPONENT STATE INTERACTION COMMANDS
        // BEGIN COMPONENT LIFECYCLE COMMANDS

        // handles an existing state from a restored session (via VS Code API, from SetExistingStateAction)
        case 'restoreExistingState':
            if (action.existingState) {
                finalState = {
                    statusFields: {
                        invalidFields: action.existingState.invalidFields
                            ? new Set<keyof Values>(action.existingState.invalidFields)
                            : action.defaultState.statusFields.invalidFields,
                        inactiveFields: action.existingState.inactiveFields
                            ? new Set<keyof Values>(action.existingState.inactiveFields)
                            : action.defaultState.statusFields.inactiveFields,
                        loadingFields: action.existingState.loadingFields
                            ? new Set<keyof Values>(action.existingState.loadingFields)
                            : action.defaultState.statusFields.loadingFields,
                        hiddenFields: action.existingState.hiddenFields
                            ? new Set<keyof Values>(action.existingState.hiddenFields)
                            : action.defaultState.statusFields.hiddenFields
                    },
                    values: {
                        ...action.defaultState.values,
                        ...action.existingState.values
                    },
                    messageQueue: action.existingState.messageQueue
                }
            } else {
                finalState = action.defaultState
            }
            break
        // this should never be hit; all cases should be covered
        default:
            break
    }

    // set VS Code retained state
    vscode.setState({
        inactiveFields: Array.from(finalState.statusFields.inactiveFields),
        invalidFields: Array.from(finalState.statusFields.invalidFields),
        loadingFields: Array.from(finalState.statusFields.loadingFields),
        hiddenFields: Array.from(finalState.statusFields.hiddenFields),
        messageQueue: finalState.messageQueue,
        values: finalState.values
    })

    return finalState
}

/**
 * Handles the BackendAlteredFields type, which contains changes to be made to the AWS Component's state
 * Added fields will always be added before computing removed fields.
 * @param set Name of set in state to handle
 * @param alteredFields BackendAlteredFields from message.
 */
function handleBackendAlteredFields<Values>(
    set: Set<keyof Values>,
    alteredFields: BackendAlteredFields<Values> | undefined
): Set<keyof Values> {
    if (alteredFields) {
        if (alteredFields.add) {
            for (const field of alteredFields.add) {
                set.add(field)
            }
        }
        if (alteredFields.remove) {
            for (const field of alteredFields.remove) {
                set.delete(field)
            }
        }
    }

    return set
}
