/*!
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { SelectOption, SubComponentProps } from '../interfaces/common'
import { JsonTextInput } from './jsonTextInput'
import { SelectDropDown } from './primitives/selectDropDown'

export interface LambdaTemplateInputProps<Values, Commands> extends SubComponentProps<Values, Commands> {
    templateOptions: SelectOption[]
    templateName: keyof Values
    templateValue: string
    jsonName: keyof Values
    jsonValue: string
    onChangeCommand: Commands
    jsonRows?: number
    jsonCols?: number
    invalidJsonMessage?: string
}

export function LambdaTemplateInput<Values, Commands>(props: LambdaTemplateInputProps<Values, Commands>) {
    return (
        <div>
            <h3>Enter a JSON payload (or select a template from the list below)</h3>
            <SelectDropDown<Values>
                name={props.templateName}
                value={props.templateValue}
                placeholder="Templates"
                options={props.templateOptions}
                setState={(key: keyof Values, value: string, callback: () => void) =>
                    props.stateInteractors.setSingleState(key, value, callback)
                }
                onSelectAction={() => onSelectTemplate(props)}
                isHidden={props.stateInteractors.getStatusFromSet('hiddenFields', props.templateName)}
                isInactive={props.stateInteractors.getStatusFromSet('inactiveFields', props.templateName)}
                isInvalid={props.stateInteractors.getStatusFromSet('invalidFields', props.templateName)}
                isLoading={props.stateInteractors.getStatusFromSet('loadingFields', props.templateName)}
            />
            <br />
            <h3>JSON Payload</h3>
            <JsonTextInput<Values, Commands>
                name={props.jsonName}
                value={props.jsonValue}
                placeholder="JSON Payload"
                rows={props.jsonRows || 20}
                cols={props.jsonCols || 75}
                stateInteractors={props.stateInteractors}
                isInvalidMessage={props.invalidJsonMessage}
            />
        </div>
    )
}

function onSelectTemplate<Values, Commands>(props: LambdaTemplateInputProps<Values, Commands>) {
    props.stateInteractors.setStatusInSet('inactiveFields', props.templateName)
    props.stateInteractors.setStatusInSet('inactiveFields', props.jsonName)
    props.stateInteractors.setStatusInSet('loadingFields', props.jsonName)
    props.stateInteractors.postMessageToVsCode(props.onChangeCommand)
}
