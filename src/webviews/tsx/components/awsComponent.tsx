/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import React = require('react')
import {
    AwsComponentState,
    BackendAlteredFields,
    BackendToAwsComponentMessage,
    VsCodeReactWebviewProp,
    VsCodeRetainedState
} from '../interfaces/common'

/**
 * Generic top-level class for AWS React Components
 * This class offers the following functionality:
 * * Typesafe React state handling and handling of VS Code Webview API functions
 *   * Includes support for VS Code get/setState for persisting a webview if it loses focus
 * * Typesafe parent state setters for child components
 * * General field state handling: can mark fields tied to values as: hidden, inactive, invalid, loading
 *   * (child components need to implement how the states are displayed; this just handles coordination)
 *
 * @type Values: A list of values that will be reflected in the AWS Component's state
 */
export abstract class AwsComponent<Values> extends React.Component<
    VsCodeReactWebviewProp<Values>,
    AwsComponentState<Values>
> {
    public constructor(props: VsCodeReactWebviewProp<Values>) {
        super(props)
        this.setExistingState(this.props.defaultState)
    }

    /**
     * Render TSX nodes here!
     */
    public abstract render(): JSX.Element

    /**
     * Sets up VS Code event listener. This should be called by React automatically
     */
    public componentDidMount(): void {
        // resetting the state with this.setState to ensure that the state is what we want
        // we know that this.setState works at this point considering the component is now mounted
        this.setState(this.state)
        window.addEventListener('message', event =>
            this.generateStateFromMessage((event.data as any) as BackendToAwsComponentMessage<Values>)
        )
    }

    /**
     * Tears down VS Code event listener. This should be called by React automatically.
     */
    public componentWillUnmount(): void {
        window.removeEventListener('message', event =>
            this.generateStateFromMessage((event.data as any) as BackendToAwsComponentMessage<Values>)
        )
    }

    /**
     * Wrapper function to set both React and VS Code state
     *
     * Sets React state (since it merges state when setting) and uses that as source of truth to set VS Code state with.
     *
     * **WARNING:** THIS IS NOT SYNCHRONOUS.
     * @param state State message to overwrite React state with
     * @param callback Callback function to run AFTER state has been set.
     */
    public setState(state: AwsComponentState<Values>, callback?: () => void): void {
        super.setState(state, () => {
            this.props.vscode.setState({
                inactiveFields: Array.from(this.state.inactiveFields),
                invalidFields: Array.from(this.state.invalidFields),
                loadingFields: Array.from(this.state.loadingFields),
                hiddenFields: Array.from(this.state.hiddenFields),
                values: this.state.values
            })
            if (callback) {
                callback()
            }
        })
    }

    /**
     * Sets the previous state of the webview if it exists in vscode.getState().
     * This state exists if a user navigates away from the webview and back without closing it.
     * Otherwise, this sets the default state.
     * Note that this function does not handle a state that is messaged in as the event listener is not initialized.
     * @param defaultState Default webview state if no other states exist
     */
    protected setExistingState(defaultState: AwsComponentState<Values>): void {
        const message = this.props.vscode.getState() as VsCodeRetainedState<Values>
        // Writes directly to state because this is called before the component is mounted (so this.setState cannot be called)
        // We will update the state with this.setState(this.state) in the componentDidMount function
        if (message) {
            this.state = {
                invalidFields: message.invalidFields
                    ? new Set<keyof Values>(message.invalidFields)
                    : defaultState.invalidFields,
                inactiveFields: message.inactiveFields
                    ? new Set<keyof Values>(message.inactiveFields)
                    : defaultState.inactiveFields,
                loadingFields: message.loadingFields
                    ? new Set<keyof Values>(message.loadingFields)
                    : defaultState.loadingFields,
                hiddenFields: message.hiddenFields
                    ? new Set<keyof Values>(message.hiddenFields)
                    : defaultState.hiddenFields,
                values: {
                    ...defaultState.values,
                    ...message.values
                }
            }
        } else {
            this.state = defaultState
        }
    }

    /**
     * Typed setState call that also deep merges the top level state object.
     *
     * Any lower-level merges need to be done manually.
     *
     * TODO: Is this really typesafe? Will this really force that this is a key, and that the value is correctly-typed?
     *
     * **WARNING:** THIS IS NOT SYNCHRONOUS.
     * @param key Key to insert as
     * @param value Value to insert
     * @param callback Callback function to run AFTER state has been set.
     */
    protected setSingleValueInState<T>(key: string, value: T, callback?: () => void): void {
        const typesafeKey = key as keyof Values
        this.setState(
            {
                ...this.state,
                values: {
                    ...this.state.values,
                    [typesafeKey]: value
                }
            },
            callback
        )
    }

    /**
     * Adds field to invalidFields set
     * @param field field to add
     */
    protected addInvalidField(field: keyof Values): void {
        this.addFieldToSet('invalidFields', field)
    }

    /**
     * Removes field from invalidFields set
     * @param field field to remove
     */
    protected removeInvalidField(field: keyof Values): void {
        this.removeFieldFromSet('invalidFields', field)
    }

    /**
     * Adds field to inactiveFields set
     * @param field field to add
     */
    protected addInactiveField(field: keyof Values): void {
        this.addFieldToSet('inactiveFields', field)
    }

    /**
     * Removes field from inactiveFields set
     * @param field field to remove
     */
    protected removeInactiveField(field: keyof Values): void {
        this.removeFieldFromSet('inactiveFields', field)
    }

    /**
     * Adds field to loadingFields set
     * @param field field to add
     */
    protected addLoadingField(field: keyof Values): void {
        this.addFieldToSet('loadingFields', field)
    }

    /**
     * Removes field from loadingFields set
     * @param field field to remove
     */
    protected removeLoadingField(field: keyof Values): void {
        this.removeFieldFromSet('loadingFields', field)
    }

    /**
     * Adds field to hiddenFields set
     * @param field field to add
     */
    protected addHiddenField(field: keyof Values): void {
        this.addFieldToSet('hiddenFields', field)
    }

    /**
     * Removes field from hiddenFields set
     * @param field field to remove
     */
    protected removeHiddenField(field: keyof Values): void {
        this.removeFieldFromSet('hiddenFields', field)
    }

    /**
     * Posts all of the state's values to the VS Code Node backend with a given command name for backend handling.
     * Does not provide any validity fields; backend logic should be able to handle everything that is passed to parent.
     * @param command Command name to send to VS Code
     */
    protected postMessageToVsCode(command: string): void {
        this.props.vscode.postMessage({
            values: this.state.values,
            command: command
        })
    }

    /**
     * Handles messaging from VS Code, either via posted message or by restoring state from VS Code.
     * Can be overwritten; it is *HIGHLY* recommended to call `super.generateStateFromMessage(message)` for state handling.
     * @param message Partial state to merge with current state
     */
    protected generateStateFromMessage(message: BackendToAwsComponentMessage<Values>): void {
        this.setState({
            ...this.state,
            values: {
                ...this.state.values,
                ...message.values
            }
        })
        if (message.loadingFields) {
            this.handleBackendAlteredFields('loadingFields', message.loadingFields)
        }
        if (message.invalidFields) {
            this.handleBackendAlteredFields('invalidFields', message.invalidFields)
        }
        if (message.inactiveFields) {
            this.handleBackendAlteredFields('inactiveFields', message.inactiveFields)
        }
        if (message.hiddenFields) {
            this.handleBackendAlteredFields('hiddenFields', message.hiddenFields)
        }
    }

    /**
     * Handles the BackendAlteredFields type, which contains changes to be made to the AWS Component's state
     * Added fields will always be added before computing removed fields.
     * @param set Name of set in state to handle
     * @param alteredFields BackendAlteredFields from message.
     */
    private handleBackendAlteredFields(
        set: keyof AwsComponentState<Values>,
        alteredFields: BackendAlteredFields<Values>
    ) {
        if (alteredFields.add) {
            for (const field of alteredFields.add) {
                this.addFieldToSet(set, field)
            }
        }
        if (alteredFields.remove) {
            for (const field of alteredFields.remove) {
                this.removeFieldFromSet(set, field)
            }
        }
    }

    /**
     * Adds a field to a state's status set.
     * This will mark the field as a part of the set (e.g. marking a field as an invalid field)
     * @param set Set to add to
     * @param field Field to add to set
     * @throws if specified set is not a Set
     */
    private addFieldToSet(set: keyof AwsComponentState<Values>, field: keyof Values) {
        const modifiedSet = this.state[set]
        if (!(modifiedSet instanceof Set)) {
            throw new Error(`React application is trying to add to non-set field: ${set}`)
        }
        modifiedSet.add(field)
        this.setState({
            ...this.state,
            [set]: modifiedSet
        })
    }

    /**
     * Removes a field from a state's status set.
     * This will unmark the field as a part of the set (e.g. marking a field as valid)
     * @param set Set to remove from
     * @param field Field to remove from set
     * @throws if specified set is not a Set
     */
    private removeFieldFromSet(set: keyof AwsComponentState<Values>, field: keyof Values) {
        const modifiedSet = this.state[set]
        if (!(modifiedSet instanceof Set)) {
            throw new Error(`React application is trying to remove from non-set field: ${set}`)
        }
        modifiedSet.delete(field)
        this.setState({
            ...this.state,
            [set]: modifiedSet
        })
    }
}
