import React from 'react'
import PropTypes from 'prop-types'
import { MAX_WIDTH, PADDING, BREAKOUT } from '../Center'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { container } from 'glamor/ous'

const styles = {
  container: css({
    maxWidth: MAX_WIDTH + PADDING * 2,
    margin: '0 auto',
    paddingTop: 30,
    paddingLeft: PADDING,
    paddingRight: PADDING,
    [mUp]: {
      paddingTop: 40,
      margin: '0 auto'
    }
  }),
  containerMargin: css({
    marginBottom: 40,
    [mUp]: {
      marginBottom: 70
    }
  })
}

const TitleBlock = ({
  children,
  attributes,
  center,
  margin
}) => {
  return (
    <section {...attributes} {...merge(styles.container, margin && styles.containerMargin)} style={{
      textAlign: center ? 'center' : undefined,
      maxWidth: center ? MAX_WIDTH + BREAKOUT + PADDING : undefined
    }}>
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
