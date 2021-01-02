/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { samLambdaRuntimes } from '../../lambda/models/samLambdaRuntime'
import { AwsComponent, createStatusFields } from './components/awsComponent'
import { DirectoryPicker } from './components/directoryPicker'
import { Button } from './components/primitives/button'
import { Input } from './components/primitives/input'
import { SelectDropDown } from './components/primitives/selectDropDown'
import { AwsComponentState, SelectOption, VsCode } from './interfaces/common'
import { CreateSamAppCommands, CreateSamAppValues } from './interfaces/createSamApp'

declare const vscode: VsCode<CreateSamAppValues, CreateSamAppCommands>

function generateDefaultCreateSamAppState(): AwsComponentState<CreateSamAppValues> {
    return {
        values: {
            appName: '',
            directory: '',
            runtime: ''
        },
        statusFields: createStatusFields<CreateSamAppValues>()
    }
}

export class CreateSamApp extends AwsComponent<CreateSamAppValues, CreateSamAppCommands> {
    public render() {
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
                <Input<CreateSamAppValues>
                    name="appName"
                    value={this.state.values.appName}
                    setState={(key: keyof CreateSamAppValues, value: string, callback?: () => void) =>
                        this.setSingleValueInState(key, value, callback)
                    }
                />
                <p>Runtime:</p>
                <SelectDropDown<CreateSamAppValues>
                    name="runtime"
                    value={this.state.values.runtime}
                    options={options}
                    placeholder="Runtimes"
                    setState={(key: keyof CreateSamAppValues, value: string, callback?: () => void) =>
                        this.setSingleValueInState(key, value, callback)
                    }
                />
                <p>Location: </p>
                <DirectoryPicker<CreateSamAppValues, CreateSamAppCommands>
                    name="directory"
                    value={this.state.values.directory}
                    command="selectDirectory"
                    text="Choose Directory"
                    stateInteractors={this.createStateInteractors()}
                />
                <Button
                    onClick={() => this.onSubmit()}
                    text="Create SAM Application"
                    isInactive={this.isButtonInactive()}
                />
            </div>
        )
    }

    private onSubmit() {
        this.postMessageToVsCode('createSamApp')
    }

    private isButtonInactive(): boolean {
        return (
            this.state.values.appName === '' ||
            this.state.values.directory === '' ||
            this.state.values.runtime === '' ||
            this.state.statusFields.invalidFields.size > 0 ||
            this.state.statusFields.loadingFields.size > 0
        )
    }
}

ReactDOM.render(
    <CreateSamApp vscode={vscode} defaultState={generateDefaultCreateSamAppState()} />,
    document.getElementById('reactApp')
)
