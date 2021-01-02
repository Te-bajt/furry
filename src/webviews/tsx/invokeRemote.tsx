/*!
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { AwsComponent } from './components/awsComponent'
import { SelectDropDown } from './components/primitives/selectDropDown'
import { TextArea } from './components/primitives/textArea'
import { AwsComponentState, BackendToAwsComponentMessage, VsCode } from './interfaces/common'
import { InvokerValues } from './interfaces/invoker'

declare const vscode: VsCode<InvokerValues>

function generateDefaultInvokerState(): AwsComponentState<InvokerValues> {
    return {
        values: {
            lambda: '',
            payload: '',
            region: '',
            template: '',
            availableTemplates: []
        },
        invalidFields: new Set<keyof InvokerValues>(),
        inactiveFields: new Set<keyof InvokerValues>(),
        loadingFields: new Set<keyof InvokerValues>(),
        hiddenFields: new Set<keyof InvokerValues>()
    }
}

export class Invoker extends AwsComponent<InvokerValues> {
    public render() {
        return (
            <div>
                <h1>
                    Calling Lambda function: {this.state.values.lambda} in Region: {this.state.values.region}
                </h1>
                <br />
                <h3>Enter a JSON payload (or select a template from the list below)</h3>
                <SelectDropDown
                    name="template"
                    options={this.state.values.availableTemplates}
                    value={this.state.values.template}
                    setState={(key: string, value: string, callback: () => void) =>
                        this.setSingleValueInState<string>(key, value, callback)
                    }
                    onSelectAction={() => this.onSelectTemplate()}
                    placeholder="Templates"
                    isInactive={this.state.inactiveFields.has('template')}
                />
                <br />
                <h3>JSON Payload</h3>
                <TextArea
                    name="payload"
                    placeholder="JSON Payload"
                    value={this.state.values.payload}
                    setState={(key: string, value: string) => this.setSingleValueInState<string>(key, value)}
                    isInvalid={this.state.invalidFields.has('payload')}
                    isInactive={this.state.inactiveFields.has('payload')}
                    isLoading={this.state.loadingFields.has('payload')}
                    rows={20}
                    cols={75}
                />
                <br />
                <button onClick={e => this.onSubmit(e)}>Submit!</button>
                <button onClick={e => this.daBomb(e)}>Light da bomb!</button>
            </div>
        )
    }

    protected generateStateFromMessage(message: BackendToAwsComponentMessage<InvokerValues>) {
        const curr = this.state.values.payload
        const incoming = message.values.payload || 'Missing!'
        super.generateStateFromMessage(message)
        this.setSingleValueInState('payload', `${curr}\n${incoming} : ${Date.now()}`)
    }

    private onSelectTemplate() {
        this.addInactiveField('template')
        this.addInactiveField('payload')
        this.addLoadingField('payload')
        this.postMessageToVsCode('sampleRequestSelected')
    }

    private onSubmit(event: React.MouseEvent) {
        try {
            // basic client-side validation test. We should probably offload something like this to the controller.
            JSON.parse(this.state.values.payload)
            this.removeInvalidField('payload')
            this.setSingleValueInState('payload', this.state.values.payload, () =>
                this.postMessageToVsCode('invokeLambda')
            )
        } catch (e) {
            this.addInvalidField('payload')
        }
    }

    private daBomb(event: React.MouseEvent) {
        this.postMessageToVsCode('daBomb')
    }
}

ReactDOM.render(
    <Invoker vscode={vscode} defaultState={generateDefaultInvokerState()} />,
    document.getElementById('reactApp')
)
