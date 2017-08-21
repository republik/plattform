import React from 'react'
import { css } from 'glamor'
import { createBlockButton } from '../utils'
import { TITLE } from './'
import styles from '../styles'

export const TitleButton = createBlockButton(TITLE)(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      Title
    </span>
)

export default {
  TitleButton
}
