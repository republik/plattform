import React from 'react'
import {
  PADDED_MAX_WIDTH,
  PADDED_MAX_WIDTH_BREAKOUT,
  MAX_WIDTH,
  PADDING,
  BREAKOUT,
} from '../Center'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  container: css({
    maxWidth: PADDED_MAX_WIDTH,
    margin: '0 auto',
    paddingTop: 30,
    paddingLeft: PADDING,
    paddingRight: PADDING,
    [mUp]: {
      paddingTop: 40,
      margin: '0 auto',
    },
  }),
  containerMargin: css({
    marginBottom: 40,
    [mUp]: {
      marginBottom: 70,
    },
  }),
}

interface TitleBlockProps {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'section'>
  center?: boolean
  margin?: boolean
  breakout?: boolean
}

const TitleBlock = ({
  children,
  attributes,
  center,
  margin,
  breakout,
}: TitleBlockProps) => {
  return (
    <section
      className='title-block'
      {...attributes}
      {...merge(styles.container, margin && styles.containerMargin)}
      style={{
        textAlign: center ? 'center' : undefined,
        maxWidth: center
          ? MAX_WIDTH + BREAKOUT + PADDING
          : breakout
          ? PADDED_MAX_WIDTH_BREAKOUT
          : undefined,
      }}
    >
      {children}
    </section>
  )
}

export default TitleBlock
