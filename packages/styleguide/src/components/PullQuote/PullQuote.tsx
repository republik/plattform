import React from 'react'
import { css } from 'glamor'
import { mUp, onlyS } from '../../theme/mediaQueries'
import { Breakout, BreakoutProps } from '../Center'

export const IMAGE_SIZE = 155

const styles = {
  container: css({
    margin: '40px auto',
    [mUp]: {
      margin: '60px auto',
    },
  }),
  containerFloat: css({
    // Vertical desktop margins are currently handled in Center.
    marginLeft: 'auto',
    marginRight: 'auto',
    [onlyS]: {
      margin: '40px auto',
    },
  }),
  figure: css({
    '& figure': {
      width: IMAGE_SIZE,
    },
    [mUp]: {
      paddingLeft: 170,
      '& figure': {
        marginLeft: -170,
        marginRight: 15,
        float: 'left',
      },
    },
  }),
  clear: css({
    [mUp]: {
      clear: 'both',
    },
  }),
}

const getBreakoutSize = (
  size: BreakoutProps['size'],
  hasFigure: boolean,
): BreakoutProps['size'] => {
  if (size === 'float') {
    return hasFigure ? 'float' : 'floatTiny'
  }
  if (size === 'breakout') {
    return 'breakoutLeft'
  }
  return size
}

type PullQuoteProps = {
  children: React.ReactNode
  attributes?: BreakoutProps['attributes']
  size?: 'narrow' | 'float' | 'breakout'
  hasFigure?: boolean
}

const PullQuote = ({
  children,
  attributes,
  hasFigure,
  size,
}: PullQuoteProps) => {
  const textAlign = !hasFigure && size === 'narrow' ? 'center' : 'inherit'
  const containerStyle =
    size === 'float' ? styles.containerFloat : styles.container

  return (
    <Breakout attributes={attributes} size={getBreakoutSize(size, hasFigure)}>
      <blockquote
        {...containerStyle}
        {...(hasFigure ? styles.figure : {})}
        style={{ textAlign }}
      >
        {children}
        <div {...styles.clear} />
      </blockquote>
    </Breakout>
  )
}

export default PullQuote
