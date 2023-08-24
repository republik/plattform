import React from 'react'
import { css } from 'glamor'

export const GUTTER = 42
export const CONTENT_PADDING = 15

export const NARROW_CONTENT_MAX_WIDTH = 680
export const CONTENT_MAX_WIDTH = 1230

const styles = {
  container: css({
    boxSizing: 'border-box',
    width: '100%',
    padding: `0 ${CONTENT_PADDING}px`,
    maxWidth: CONTENT_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto',
  }),
  narrowContainer: css({
    boxSizing: 'border-box',
    width: '100%',
    padding: `0 ${CONTENT_PADDING}px`,
    maxWidth: NARROW_CONTENT_MAX_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto',
  }),
}

type ContainerProps = {
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'div'>

export const Container = ({ children, ...props }: ContainerProps) => (
  <div {...props} {...styles.container}>
    {children}
  </div>
)

export const NarrowContainer = ({ children, ...props }: ContainerProps) => (
  <div {...props} {...styles.narrowContainer}>
    {children}
  </div>
)
