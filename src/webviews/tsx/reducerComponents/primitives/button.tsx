/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react'
import { PrimitiveProps } from '../../interfaces/common'
import { generateClassString } from './common'

export interface ButtonProps extends PrimitiveProps {
    text: string
    onClick(event: React.MouseEvent): void
}

export function Button(props: ButtonProps) {
    return (
        <button onClick={e => props.onClick(e)} className={generateClassString(props)} disabled={props.isInactive}>
            {props.text}
        </button>
    )
}
