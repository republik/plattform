import React from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import colors from '../../theme/colors'
import { convertStyleToRem } from './utils'

export {
  List,
  UnorderedList as UL,
  OrderedList as OL,
  ListItem as LI
} from '../List'

const headline = css({
  ...convertStyleToRem(styles.cursiveTitle30),
  margin: '0 0 12px 0',
  [mUp]: {
    ...convertStyleToRem(styles.cursiveTitle58),
    margin: '0 0 12px 0'
  },
  color: colors.text,
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  }
})

export const Headline = ({ children, attributes, ...props }) => (
  <h1 {...attributes} {...props} {...headline}>
    {children}
  </h1>
)
