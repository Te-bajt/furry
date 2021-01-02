/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert'
import * as React from 'react'

import { AwsComponent, createStatusFields } from '../../../../webviews/tsx/components/awsComponent'
import {
    AwsComponentState,
    AwsComponentToBackendMessage,
    StatusFields,
    VsCode,
    VsCodeRetainedState
} from '../../../../webviews/tsx/interfaces/common'

interface TestVals {
    testStr: string
    testNum: number
    testBool: boolean
    testArr: string[]
}

type TestCommands = 'command1' | 'command2' | 'command3'

class TestAwsComponent extends AwsComponent<TestVals, TestCommands> {
    public render() {
        return <div></div>
    }

    public setSingleValueInState<T>(key: keyof TestVals, value: T, callback?: () => void): void {
        super.setSingleValueInState(key, value, callback)
    }

    public postMessageToVsCode(command: TestCommands) {
        super.postMessageToVsCode(command)
    }

    public checkFieldInSet(set: keyof StatusFields<TestVals>, field: keyof TestVals): boolean {
        return super.checkFieldInSet(set, field)
    }

    public addFieldToSet(set: keyof StatusFields<TestVals>, field: keyof TestVals): void {
        super.addFieldToSet(set, field)
    }

    public removeFieldFromSet(set: keyof StatusFields<TestVals>, field: keyof TestVals): void {
        super.removeFieldFromSet(set, field)
    }

    public createStateInteractors() {
        return super.createStateInteractors()
    }
}

// TODO: How do we mount components so we don't have to worry about setState failing?
// TODO: How do we test the incoming message listener?
// TODO: Add Enzyme so we can test render functions. We will need this for testing individual AwsComponents
describe('AwsComponent', () => {
    let vsCodeState: VsCodeRetainedState<TestVals> | undefined
    let vsCodePostedMessage: AwsComponentToBackendMessage<TestVals, TestCommands> | undefined
    let testComponent: TestAwsComponent

    const testVals: TestVals = {
        testStr: 'test1',
        testNum: 1,
        testBool: false,
        testArr: ['did', 'i', 'stutter?']
    }

    const altTestVals: TestVals = {
        testStr: 'test2',
        testNum: 10,
        testBool: true,
        testArr: ['i', 'did', 'stutter']
    }

    const testInvalidFields: Array<keyof TestVals> = ['testArr']
    const testLoadingFields: Array<keyof TestVals> = ['testArr', 'testBool']
    const testInactiveFields: Array<keyof TestVals> = []
    const testHiddenFields: Array<keyof TestVals> = ['testArr', 'testStr', 'testNum']

    const testStatusFields: StatusFields<TestVals> = {
        invalidFields: new Set(testInvalidFields),
        inactiveFields: new Set(testInactiveFields),
        loadingFields: new Set(testLoadingFields),
        hiddenFields: new Set(testHiddenFields)
    }

    const defaultState: AwsComponentState<TestVals> = {
        values: testVals,
        statusFields: testStatusFields
    }

    const testVsCode: VsCode<TestVals, TestCommands> = {
        postMessage: vsCodePostMessageHandler,
        setState: vsCodeStateSetter,
        getState: () => vsCodeState
    }

    function vsCodeStateSetter(state: VsCodeRetainedState<TestVals>) {
        vsCodeState = state
    }

    function vsCodePostMessageHandler(output: AwsComponentToBackendMessage<TestVals, TestCommands>) {
        vsCodePostedMessage = output
    }

    describe('AwsComponent abstract class functions', () => {
        beforeEach(() => {
            vsCodeState = undefined
            vsCodePostedMessage = undefined

            testComponent = new TestAwsComponent({
                defaultState,
                vscode: testVsCode
            })
        })

        it('loads a default state provided by component props', () => {
            assert.deepStrictEqual(testComponent.state, defaultState)
        })

        it('loads a default state provided by the VS Code getState function', () => {
            vsCodeState = {
                values: altTestVals
            }
            testComponent = new TestAwsComponent({
                defaultState,
                vscode: testVsCode
            })
            assert.deepStrictEqual(testComponent.state.values, altTestVals)
            assert.deepStrictEqual(testComponent.state.statusFields, defaultState.statusFields)
        })

        it('can set a new state, which is reflected by React and VS Code', () => {
            const newState: AwsComponentState<TestVals> = {
                values: altTestVals,
                statusFields: testStatusFields
            }
            assert.deepStrictEqual(testComponent.state, defaultState, 'initial state does not match')
            testComponent.setState(
                () => {
                    return newState
                },
                () => {
                    assert.deepStrictEqual(testComponent.state, newState, 'react state does not match')
                    assert.deepStrictEqual(
                        testComponent.props.vscode.getState(),
                        {
                            values: altTestVals,
                            inactiveFields: testInactiveFields,
                            invalidFields: testInvalidFields,
                            hiddenFields: testHiddenFields,
                            loadingFields: testLoadingFields
                        },
                        'vscode.getState does not match'
                    )
                }
            )
        })

        it('can send messages to the backend in the form of an AwsComponentToBackendMessage ', () => {
            testComponent.postMessageToVsCode('command1')
            assert.deepStrictEqual(vsCodePostedMessage, {
                values: testComponent.state.values,
                command: 'command1'
            })
        })

        it('can set a single str value in the state', () => {
            const newStr = "i'm different"
            testComponent.setSingleValueInState('testStr', newStr, () => {
                assert.strictEqual(testComponent.state.values.testStr, newStr)
            })
        })

        it('can set a single number value in the state', () => {
            const newNum = 27
            testComponent.setSingleValueInState('testNum', newNum, () => {
                assert.strictEqual(testComponent.state.values.testNum, newNum)
            })
        })

        it('can set a single boolean value in the state', () => {
            const newBool = true
            testComponent.setSingleValueInState('testBool', newBool, () => {
                assert.strictEqual(testComponent.state.values.testBool, newBool)
            })
        })

        it('can update an array value in the state', () => {
            const newStr = 'yup'
            const newArr = testComponent.state.values.testArr
            newArr.push(newStr)
            testComponent.setSingleValueInState('testArr', newArr, () => {
                assert.strictEqual(testComponent.state.values.testArr, newArr)
            })
        })

        it('returns true if a field is in a set', () => {
            assert.ok(testComponent.checkFieldInSet('hiddenFields', 'testStr'))
        })

        it('returns false if a field is in a set', () => {
            assert.ok(!testComponent.checkFieldInSet('inactiveFields', 'testStr'))
        })

        it('can add a field to a set', () => {
            assert.strictEqual(testComponent.state.statusFields.inactiveFields.size, 0)
            testComponent.addFieldToSet('inactiveFields', 'testStr')
            assert.strictEqual(testComponent.state.statusFields.inactiveFields.size, 1)
            assert.ok(testComponent.state.statusFields.inactiveFields.has('testStr'))
        })

        it('can remove a field from a set', () => {
            assert.strictEqual(testComponent.state.statusFields.hiddenFields.size, 3)
            testComponent.removeFieldFromSet('hiddenFields', 'testStr')
            assert.strictEqual(testComponent.state.statusFields.hiddenFields.size, 2)
            assert.ok(!testComponent.state.statusFields.hiddenFields.has('testStr'))
        })

        it('creates usable state interactors', () => {
            const stateInteractors = testComponent.createStateInteractors()

            // stateInteractors.getStatusFromSet === AwsComponent.checkFieldInSet
            assert.ok(stateInteractors.getStatusFromSet('inactiveFields', 'testStr'))

            // stateInteractors.postMessageToVsCode === AwsComponent.postMessageToVsCode
            stateInteractors.postMessageToVsCode('command1')
            assert.deepStrictEqual(vsCodePostedMessage, {
                values: testComponent.state.values,
                command: 'command1'
            })

            // stateInteractors.removeStatusFromSet === AwsComponent.removeFieldFromSet
            stateInteractors.removeStatusFromSet('hiddenFields', 'testStr')
            assert.strictEqual(testComponent.state.statusFields.hiddenFields.size, 2)
            assert.ok(!testComponent.state.statusFields.hiddenFields.has('testStr'))

            // stateInteractors.setSingleState === AwsComponent.setSingleValueInState
            const newStr = 'hello there!'
            stateInteractors.setSingleState('testStr', newStr, () => {
                assert.strictEqual(testComponent.state.values.testStr, newStr)
            })

            // stateInteractors.setStatusInSet === AwsComponent.addFieldToSet
            stateInteractors.setStatusInSet('inactiveFields', 'testStr')
            assert.strictEqual(testComponent.state.statusFields.inactiveFields.size, 1)
            assert.ok(testComponent.state.statusFields.inactiveFields.has('testStr'))
        })
    })

    describe('AwsComponent non-class helper functions', () => {
        describe('createStatusFields', () => {
            it('creates empty status fields', () => {
                const fields = createStatusFields<TestVals>()
                assert.strictEqual(fields.invalidFields.size, 0)
                assert.strictEqual(fields.inactiveFields.size, 0)
                assert.strictEqual(fields.loadingFields.size, 0)
                assert.strictEqual(fields.hiddenFields.size, 0)
            })
        })
    })
})
