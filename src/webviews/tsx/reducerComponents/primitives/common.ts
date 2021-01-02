/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrimitiveProps } from '../../interfaces/common'

/**
 * Generates a class string based on field validity, isActive, visibility, and isLoading
 * @param props Props that extend SubComponentProps
 */
export function generateClassString(props: PrimitiveProps): string {
    return (
        `${props.isInvalid ? 'invalid' : 'valid'}` +
        ` ${props.isInactive ? 'inactive' : 'active'}` +
        ` ${props.isHidden ? 'hidden' : 'unhidden'}` +
        ` ${props.isLoading ? 'loading' : 'loaded'}`
    )
}
