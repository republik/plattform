import React from 'react'
import { css } from 'glamor'
import { createBlockButton } from '../../utils'
import { BLOCKQUOTE } from './constants'
import styles from '../../styles'

export const BlockquoteButton = createBlockButton({
  type: BLOCKQUOTE
})(
  ({ active, disabled, visible, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
      >
      Zitat
    </span>
)
