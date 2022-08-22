import React from 'react'
import { css } from 'glamor'

const styles = {
  container: css({
    borderBottom: '2px solid white',
    '& > *': {
      maxWidth: 700,
      margin: '0 auto',
    },
    '& > h1': {
      maxWidth: 900,
    },
    '& > :not(.ui-element)': {
      paddingTop: 90,
    },
    '& > :not(.ui-element) ~ :not(.ui-element)': {
      paddingTop: 'inherit',
    },
    '& > :last-child': {
      paddingBottom: 90,
    },
  }),
}

export const FlyerTile: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  return (
    <div {...props} {...attributes} {...styles.container}>
      {children}
    </div>
  )
}
