import React from 'react'
import { css } from 'glamor'
import { createBlockButton } from '../../utils'
import { PARAGRAPH } from './constants'
import styles from '../../styles'

export const ParagraphButton = createBlockButton({
  type: PARAGRAPH
})(
  ({ active, disabled, visible, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
      >
      Paragraph
    </span>
)
