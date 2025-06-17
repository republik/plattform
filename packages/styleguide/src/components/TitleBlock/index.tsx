import { css, merge } from 'glamor'
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import { mUp } from '../../theme/mediaQueries'
import {
  BREAKOUT,
  MAX_WIDTH,
  PADDED_MAX_WIDTH,
  PADDED_MAX_WIDTH_BREAKOUT,
  PADDING,
} from '../Center'

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
    '@media print': {
      width: MAX_WIDTH,
      paddingTop: 0,
      paddingBottom: 40,
    },
  }),
  containerMargin: css({
    marginBottom: 40,
    [mUp]: {
      marginBottom: 70,
    },
  }),
}

const TitleBlock = ({
  children,
  attributes,
  center,
  margin,
  breakout,
}: {
  children: ReactNode
  attributes?: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
  center?: boolean
  margin?: boolean
  breakout?: boolean
}) => {
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
