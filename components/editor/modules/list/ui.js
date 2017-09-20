import React from 'react'
import { css } from 'glamor'
import { createBlockButton } from '../../utils'
import { UL } from './constants'
import styles from '../../styles'

export const ULButton = createBlockButton({
  type: UL
})(
  ({ active, disabled, visible, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
      >
      UL
    </span>
)
