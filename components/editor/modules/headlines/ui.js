import React from 'react'
import { css } from 'glamor'
import { createBlockButton } from '../../utils'
import {
  TITLE,
  MEDIUM_HEADLINE,
  SMALL_HEADLINE
} from './constants'
import styles from '../../styles'

export const TitleButton = createBlockButton({
  type: TITLE
})(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      Title
    </span>
)

export const MediumHeadlineButton = createBlockButton({
  type: MEDIUM_HEADLINE
})(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      Medium Headline
    </span>
)

export const SmallHeadlineButton = createBlockButton({
  type: SMALL_HEADLINE
})(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      Small Headline
    </span>
)
