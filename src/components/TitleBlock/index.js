import React from 'react'
import PropTypes from 'prop-types'
import { MAX_WIDTH, PADDING, BREAKOUT } from '../Center'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Editorial } from '../Typography'

const styles = {
  container: css({
    maxWidth: MAX_WIDTH,
    margin: '0 auto 40px auto',
    paddingTop: 30,
    paddingLeft: PADDING,
    paddingRight: PADDING,
    [mUp]: {
      paddingTop: 40,
      margin: '0 auto 70px auto'
    }
  })
}

const TitleBlock = ({
  children,
  attributes,
  center,
  kind,
  format
}) => {
  return (
    <section {...attributes} {...styles.container} style={{
      textAlign: center ? 'center' : undefined,
      maxWidth: center ? MAX_WIDTH + BREAKOUT + PADDING : undefined
    }}>
      {format && <Editorial.Format kind={kind} contentEditable={false}>{format}</Editorial.Format>}
      {children}
    </section>
  )
}

TitleBlock.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  center: PropTypes.bool
}

export default TitleBlock
