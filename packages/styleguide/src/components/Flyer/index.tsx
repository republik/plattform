import React from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'

export const FLYER_CONTAINER_MAXWIDTH = 700

const styles = {
  container: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  }),
  content: css({
    maxWidth: FLYER_CONTAINER_MAXWIDTH,
    margin: '0 auto',
    padding: '50px 15px',
    [mUp]: {
      padding: '90px 0',
    },
    '& > *': {},
    '& > :not(.ui-element)': {
      // paddingTop: 90,
    },
    '& > :not(.ui-element) ~ :not(.ui-element)': {
      // paddingTop: 'inherit',
    },
    '& > :last-child': {
      marginBottom: '0 !important',
    },
  }),
}

export const FlyerTile: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...props}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
    >
      <div {...styles.content}>{children}</div>
    </div>
  )
}
