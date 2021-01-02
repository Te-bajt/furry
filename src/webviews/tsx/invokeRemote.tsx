/*!
 * Copyright 2019-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { AwsComponent, createStatusFields } from './components/awsComponent'
import { LambdaTemplateInput } from './components/lambdaTemplateInput'
import { Button } from './components/primitives/button'
import { AwsComponentState, VsCode } from './interfaces/common'
import { InvokerCommands, InvokerValues } from './interfaces/invoker'

declare const vscode: VsCode<InvokerValues, InvokerCommands>

function generateDefaultInvokerState(): AwsComponentState<InvokerValues> {
    return {
        values: {
            lambda: '',
            payload: '',
            region: '',
            template: '',
            availableTemplates: []
        },
        statusFields: createStatusFields<InvokerValues>()
    }
}

export class InvokeRemote extends AwsComponent<InvokerValues, InvokerCommands> {
    public render() {
        return (
            <div>
                <h1>
                    Calling Lambda function: {this.state.values.lambda} in Region: {this.state.values.region}
                </h1>
                <br />
                <LambdaTemplateInput<InvokerValues, InvokerCommands>
                    templateName="template"
                    jsonName="payload"
                    templateValue={this.state.values.template}
                    jsonValue={this.state.values.payload}
                    templateOptions={this.state.values.availableTemplates}
                    invalidJsonMessage="Payload is not valid JSON."
                    onChangeCommand="sampleRequestSelected"
                    stateInteractors={this.createStateInteractors()}
                />
                <br />
                <Button onClick={() => this.onSubmit()} text="Submit!" />
            </div>
        )
    }

    // create button primitive that returns the command to post?
    private onSubmit() {
        try {
            // basic client-side validation test. We should probably offload something like this to the controller.
            JSON.parse(this.state.values.payload)
            this.removeFieldFromSet('invalidFields', 'payload')
            this.setSingleValueInState('payload', this.state.values.payload, () =>
                this.postMessageToVsCode('invokeLambda')
            )
        } catch (e) {
            this.addFieldToSet('invalidFields', 'payload')
        }
    }
}

ReactDOM.render(
    <InvokeRemote vscode={vscode} defaultState={generateDefaultInvokerState()} />,
    document.getElementById('reactApp')
)
