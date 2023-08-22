import React from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from './utils'
import { useColorContext } from '../Colors/useColorContext'

export {
  List,
  UnorderedList as UL,
  OrderedList as OL,
  ListItem as LI,
} from '../List'

const headline = css({
  ...convertStyleToRem(styles.cursiveTitle30),
  margin: '0 0 12px 0',
  [mUp]: {
    ...convertStyleToRem(styles.cursiveTitle58),
    margin: '0 0 12px 0',
  },
  ':first-child': {
    marginTop: 0,
  },
  ':last-child': {
    marginBottom: 0,
  },
})

type HeadlineProps = {
  children: React.ReactNode
  attributes: React.HTMLAttributes<HTMLHeadingElement>
} & React.HTMLAttributes<HTMLHeadingElement>

export const Headline = ({ children, attributes, ...props }: HeadlineProps) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...attributes}
      {...colorScheme.set('color', 'text')}
      {...props}
      {...headline}
    >
      {children}
    </h1>
  )
}
