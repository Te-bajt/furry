/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import {
    AwsComponentProps,
    AwsComponentState,
    BackendAlteredFields,
    BackendToAwsComponentMessage,
    StatusFields,
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
export abstract class AwsComponent<Values, Commands> extends React.Component<
    AwsComponentProps<Values, Commands>,
    AwsComponentState<Values>
> {
    private isProcessingMessages: boolean

    public constructor(props: AwsComponentProps<Values, Commands>) {
        super(props)
        this.setExistingState(this.props.defaultState)
        this.isProcessingMessages = false
    }

    /**
     * Render TSX nodes here!
     */
    public abstract render(): JSX.Element

    /**
     * Sets up VS Code event listener. This should be called by React automatically
     */
    public componentDidMount(): void {
        window.addEventListener('message', event =>
            this.handleIncomingMessage((event.data as any) as BackendToAwsComponentMessage<Values>)
        )
        // process any messages that were in the queue prior to losing focus
        this.processMessageQueue()
    }

    /**
     * Tears down VS Code event listener. This should be called by React automatically.
     */
    public componentWillUnmount(): void {
        window.removeEventListener('message', event =>
            this.handleIncomingMessage((event.data as any) as BackendToAwsComponentMessage<Values>)
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
    public setState(
        updater: (
            state: AwsComponentState<Values>,
            props: AwsComponentProps<Values, Commands>
        ) => AwsComponentState<Values>,
        callback?: () => void
    ): void {
        super.setState(updater, () => {
            this.props.vscode.setState({
                inactiveFields: Array.from(this.state.statusFields.inactiveFields),
                invalidFields: Array.from(this.state.statusFields.invalidFields),
                loadingFields: Array.from(this.state.statusFields.loadingFields),
                hiddenFields: Array.from(this.state.statusFields.hiddenFields),
                messageQueue: this.state.messageQueue,
                values: this.state.values
            })
            if (callback) {
                callback()
            }
        })
    }

    /**
     * Typed setState call that also deep merges the top level state object.
     *
     * This only merges into the `values` field, not the `statusFields`.
     *
     * Any lower-level merges need to be done manually.
     *
     * **WARNING:** THIS IS NOT SYNCHRONOUS.
     * @param key Key to insert as
     * @param value Value to insert
     * @param callback Callback function to run AFTER state has been set.
     */
    protected setSingleValueInState<T>(key: keyof Values, value: T, callback?: () => void): void {
        this.setState((state: AwsComponentState<Values>, props: AwsComponentProps<Values, Commands>) => {
            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: value
                }
            }
        }, callback)
    }

    /**
     * Posts all of the state's values to the VS Code Node backend with a given command name for backend handling.
     * Does not provide any validity fields; backend logic should be able to handle everything that is passed to parent.
     * @param command Command name to send to VS Code
     */
    protected postMessageToVsCode(command: Commands): void {
        this.props.vscode.postMessage({
            values: this.state.values,
            command: command
        })
    }

    /**
     * Returns a boolean based on whether or not a field is in a defined set.
     * @param set Set to check
     * @param field Field name to check
     */
    protected checkFieldInSet(set: keyof StatusFields<Values>, field: keyof Values): boolean {
        return this.state.statusFields[set].has(field)
    }

    /**
     * Adds a field to a state's status set.
     * This will mark the field as a part of the set (e.g. marking a field as an invalid field)
     * @param set Set to add to
     * @param field Field to add to set
     * @throws if specified set is not a Set
     */
    protected addFieldToSet(set: keyof StatusFields<Values>, field: keyof Values): void {
        const modifiedSet = this.state.statusFields[set]
        modifiedSet.add(field)
        this.setState((state: AwsComponentState<Values>, props: AwsComponentProps<Values, Commands>) => {
            return {
                ...state,
                [set]: modifiedSet
            }
        })
    }

    /**
     * Removes a field from a state's status set.
     * This will unmark the field as a part of the set (e.g. marking a field as valid)
     * @param set Set to remove from
     * @param field Field to remove from set
     * @throws if specified set is not a Set
     */
    protected removeFieldFromSet(set: keyof StatusFields<Values>, field: keyof Values): void {
        const modifiedSet = this.state.statusFields[set]
        modifiedSet.delete(field)
        this.setState((state: AwsComponentState<Values>, props: AwsComponentProps<Values, Commands>) => {
            return {
                ...state,
                [set]: modifiedSet
            }
        })
    }

    /**
     * Creates stateInteractors for SubComponentProps.
     */
    protected createStateInteractors() {
        return {
            getStatusFromSet: (set: keyof StatusFields<Values>, field: keyof Values) =>
                this.checkFieldInSet(set, field),
            postMessageToVsCode: (command: Commands) => this.postMessageToVsCode(command),
            removeStatusFromSet: (set: keyof StatusFields<Values>, value: keyof Values) =>
                this.removeFieldFromSet(set, value),
            setSingleState: (key: keyof Values, value: string, callback: () => void) =>
                this.setSingleValueInState(key, value, callback),
            setStatusInSet: (set: keyof StatusFields<Values>, value: keyof Values) => this.addFieldToSet(set, value)
        }
    }

    /**
     * Inserts incoming messages into message queue and begins dequeueing if dequeueing hasn't already started.
     * Message queue is a part of React state; if a message is enqueued before the window loses focus, it will be processable when focus is restored.
     * However, this does not protect against a window gaining and losing focus before React is mounted;
     * This means that VS Code pushed the event into the JS Event Queue, which is dumped when the window re-loses focus.
     * @param incomingMessage Incoming message from backend
     */
    private handleIncomingMessage(incomingMessage: BackendToAwsComponentMessage<Values>): void {
        // setState call to add message to queue
        this.setState(
            (state: AwsComponentState<Values>, props: AwsComponentProps<Values, Commands>) => {
                const currQueue = state.messageQueue || []
                currQueue.push(incomingMessage)

                return {
                    ...state,
                    messageQueue: currQueue
                }
                // ...then process the message if the queue isn't already being processed
            },
            () => {
                if (!this.isProcessingMessages) {
                    this.processMessageQueue()
                }
            }
        )
    }

    /**
     * Processes message queue
     */
    private processMessageQueue(): void {
        // queue is now processing message
        this.isProcessingMessages = true
        // should always pass
        if (this.state.messageQueue) {
            const messageQueue = this.state.messageQueue
            // dequeue first message
            const firstMessage = messageQueue.shift()
            if (firstMessage) {
                this.setState(
                    (state: AwsComponentState<Values>, props: AwsComponentProps<Values, Commands>) => {
                        // updates status fields using current state from setState function
                        const updatedStatusFields: StatusFields<Values> = {
                            inactiveFields: this.handleBackendAlteredFields(
                                state.statusFields.inactiveFields,
                                firstMessage.inactiveFields
                            ),
                            invalidFields: this.handleBackendAlteredFields(
                                state.statusFields.invalidFields,
                                firstMessage.invalidFields
                            ),
                            hiddenFields: this.handleBackendAlteredFields(
                                state.statusFields.hiddenFields,
                                firstMessage.hiddenFields
                            ),
                            loadingFields: this.handleBackendAlteredFields(
                                state.statusFields.loadingFields,
                                firstMessage.loadingFields
                            )
                        }

                        // build new state so we only have to set once to decrease state variance
                        return {
                            values: {
                                ...state.values,
                                ...firstMessage.values
                            },
                            statusFields: updatedStatusFields,
                            messageQueue // represents dequeued message queue
                        }
                        // recursive call to process the next message
                    },
                    () => this.processMessageQueue()
                )
            }
        }
        // queue is done processing messages
        this.isProcessingMessages = false
    }

    /**
     * Handles the BackendAlteredFields type, which contains changes to be made to the AWS Component's state
     * Added fields will always be added before computing removed fields.
     * @param set Name of set in state to handle
     * @param alteredFields BackendAlteredFields from message.
     */
    private handleBackendAlteredFields(
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

    /**
     * Sets the previous state of the webview if it exists in vscode.getState().
     * This state exists if a user navigates away from the webview and back without closing it.
     * Otherwise, this sets the default state.
     * Note that this function does not handle a state that is messaged in as the event listener is not initialized.
     * @param defaultState Default webview state if no other states exist
     */
    private setExistingState(defaultState: AwsComponentState<Values>): void {
        const message = this.props.vscode.getState() as VsCodeRetainedState<Values>
        // Writes directly to state because this is called before the component is mounted (so this.setState cannot be called)
        // We will update the state with this.setState(this.state) in the componentDidMount function
        if (message) {
            this.state = {
                statusFields: {
                    invalidFields: message.invalidFields
                        ? new Set<keyof Values>(message.invalidFields)
                        : defaultState.statusFields.invalidFields,
                    inactiveFields: message.inactiveFields
                        ? new Set<keyof Values>(message.inactiveFields)
                        : defaultState.statusFields.inactiveFields,
                    loadingFields: message.loadingFields
                        ? new Set<keyof Values>(message.loadingFields)
                        : defaultState.statusFields.loadingFields,
                    hiddenFields: message.hiddenFields
                        ? new Set<keyof Values>(message.hiddenFields)
                        : defaultState.statusFields.hiddenFields
                },
                values: {
                    ...defaultState.values,
                    ...message.values
                },
                messageQueue: message.messageQueue
            }
        } else {
            this.state = defaultState
        }
    }
}

/**
 * Creates default status fields.
 * Outside of class body so we can initialize default fields separately.
 */
export function createStatusFields<Values>() {
    return {
        invalidFields: new Set<keyof Values>(),
        inactiveFields: new Set<keyof Values>(),
        loadingFields: new Set<keyof Values>(),
        hiddenFields: new Set<keyof Values>()
    }
}
