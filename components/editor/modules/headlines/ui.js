import React from 'react'
import { css } from 'glamor'
import { createBlockButton } from '../../utils'
import {
  MEDIUM_HEADLINE,
  SMALL_HEADLINE
} from './constants'
import styles from '../../styles'

export const MediumHeadlineButton = createBlockButton({
  type: MEDIUM_HEADLINE
})(
  ({ active, disabled, visible, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
      >
      H2
    </span>
)

export const SmallHeadlineButton = createBlockButton({
  type: SMALL_HEADLINE
})(
  ({ active, disabled, visible, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
      >
      H3
    </span>
)
