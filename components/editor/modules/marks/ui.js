import React from 'react'
import BoldIcon from 'react-icons/lib/fa/bold'
import ItalicIcon from 'react-icons/lib/fa/italic'
import UnderlineIcon from 'react-icons/lib/fa/underline'
import StrikethroughIcon from 'react-icons/lib/fa/strikethrough'
import { css } from 'glamor'

import styles from '../styles'
import { createMarkButton } from '../utils'
import { BOLD, ITALIC, UNDERLINE, STRIKETHROUGH } from './'

export const BoldButton = createMarkButton({
  type: BOLD
})(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.markButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      <BoldIcon />
    </span>
)

export const ItalicButton = createMarkButton({
  type: ITALIC
})(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.markButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      <ItalicIcon />
    </span>
)

export const UnderlineButton = createMarkButton({
  type: UNDERLINE
})(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.markButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      <UnderlineIcon />
    </span>
)

export const StrikethroughButton = createMarkButton({
  type: STRIKETHROUGH
})(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.markButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      <StrikethroughIcon />
    </span>
)
