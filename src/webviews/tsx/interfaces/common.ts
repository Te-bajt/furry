/*!
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Wrapper interface for the Webview VS Code API:
 * @function postMessage: Posts a message to the Node controller.
 * @function setState: Sets the VS Code webview state so the webview can reload the view if the webview loses focus and isn't persistant.
 * @function getState: Gets the VS Code webview state, used upon regaining focus without full persistence.
 */
export interface VsCode<Values, Commands> {
    postMessage(output: AwsComponentToBackendMessage<Values, Commands>): void
    setState(state: VsCodeRetainedState<Values>): void
    getState(): VsCodeRetainedState<Values> | undefined
}

/**
 * State of an AWS React component.
 * Values contain all values going between the frontend and backend.
 * `*`Fields represent fields that are invalid, inactive, loading, or hidden.
 * The above fields should be reflected on the component level.
 */
export interface AwsComponentState<Values> {
    values: Values
    statusFields: StatusFields<Values>
    messageQueue?: BackendToAwsComponentMessage<Values>[]
}

/**
 * Sets which hold field statuses for an AwsComponent
 * Holds status for invalid, inactive, hidden, and currently-loading fields.
 */
export interface StatusFields<Values> {
    invalidFields: Set<keyof Values>
    inactiveFields: Set<keyof Values>
    loadingFields: Set<keyof Values>
    hiddenFields: Set<keyof Values>
}

/**
 * Frontend to backend messaging interface; use this when sending a command from the frontend to the backend.
 * Includes the whole list of current values and a command that the backend should execute.
 * Values can be validated on the front or backend; there is no guarantee all values will be valid, just typesafe.
 */
export interface AwsComponentToBackendMessage<Values, Commands> {
    values: Values
    command: Commands
}

/**
 * Backend to frontend messaging; use this when sending a response to the fronend.
 * This should automatically be handled by the `AwsComponent.generateStateFromMessage` function (can be overridden).
 * `BackendAlteredFields` fields represent changes in frontend state
 * `values` is merged with the existing frontend state's values, with the incoming values taking precedence.
 * Only message in values that should be overridden.
 */
export interface BackendToAwsComponentMessage<Values> {
    values: Partial<Values>
    loadingFields?: BackendAlteredFields<Values>
    invalidFields?: BackendAlteredFields<Values>
    inactiveFields?: BackendAlteredFields<Values>
    hiddenFields?: BackendAlteredFields<Values>
}

/**
 * Represents a list of changes to be made to the frontend's fields' states.
 * `add` will by default be executed first.
 */
export interface BackendAlteredFields<Values> {
    add?: Array<keyof Values>
    remove?: Array<keyof Values>
}

/**
 * Represents the state retained by VS Code when navigating away from the webview.
 * Should be set automatically on the AwsComponent level
 */
export interface VsCodeRetainedState<Values> {
    values: Partial<Values>
    invalidFields?: Array<keyof Values>
    inactiveFields?: Array<keyof Values>
    loadingFields?: Array<keyof Values>
    hiddenFields?: Array<keyof Values>
    messageQueue?: BackendToAwsComponentMessage<Values>[]
}

/**
 * Base props for the top level object.
 * Enforces state and grants access to the VS Code functions
 */
export interface AwsComponentProps<Values, Commands> {
    vscode: VsCode<Values, Commands>
    defaultState: AwsComponentState<Values>
}

/**
 * Used in a select box. Value is provided to the backend, display name is displayed in the select box
 */
export interface SelectOption {
    displayName: string
    value: string
}

/**
 * Generic props for primitives. Required for generating a class string.
 */
export interface PrimitiveProps {
    isInactive?: boolean
    isInvalid?: boolean
    isHidden?: boolean
    isLoading?: boolean
}

/**
 * Generic props for SubComponents
 * These contain utility functions to determine field status and interact with the parent component/backend.
 * @function getStatusFromSet Returns whether or not a field is in the parent AwsComponent's validity set.
 * @function postMessageToVsCode Parent function to post a message to VS Code containing a command name and the whole AwsComponent's `values`. Available commands are based on command type.
 * @function removeStatusFromSet Removes a value from a parent AwsComponent's validity set.
 * @function setSingleState Sets a value in the parent AwsComponent's state.
 * @function setStatusInSet Sets a status in the parent AwsComponent's state.
 */
export interface SubComponentProps<Values, Commands> {
    stateInteractors: {
        getStatusFromSet(set: keyof StatusFields<Values>, value: keyof Values): boolean
        postMessageToVsCode(command: Commands): void
        removeStatusFromSet(set: keyof StatusFields<Values>, value: keyof Values): void
        setSingleState(key: keyof Values, value: any, callback: () => void): void
        setStatusInSet(set: keyof StatusFields<Values>, value: keyof Values): void
    }
}
