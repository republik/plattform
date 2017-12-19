import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, dUp } from '../TeaserFront/mediaQueries'
import MoreLink from './MoreLink'

const styles = {
  container: css({
    backgroundColor: '#f5f5f5',
    position: 'relative',
    lineHeight: 0,
    margin: 0,
    padding: '60px 0 40px 0',
    [dUp]: {
      background: 'none'
    }
  }),
  textContainer: css({
    padding: '15px',
    [mUp]: {
      //padding: '40px 15% 70px 15%'
    },
    [dUp]: {
      padding: 0
    }
  })
}

const Teaser = ({ t, children, attributes, onClick, moreCount }) => {
  return (
    <div
      {...attributes}
      {...styles.container}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div {...styles.textContainer}>
        {children}
        {moreCount && <MoreLink count={moreCount} t={t} />}
      </div>
    </div>
  )
}

Teaser.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  onClick: PropTypes.func,
  moreCount: PropTypes.number
}

Teaser.defaultProps = {}

export default Teaser
