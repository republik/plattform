import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import Text from './Text'

export const MAX_WIDTH_PERCENT = 70

const styles = {
  root: css({
    margin: 0
  }),
  textContainer: css({
    margin: '0 auto',
    padding: '15px',
    [mUp]: {
      maxWidth: `${MAX_WIDTH_PERCENT}%`,
      padding: '30px 0'
    },
    [tUp]: {
      padding: '50px 0'
    }
  })
}

const TypoBlock = ({ children, attributes, onClick, color, bgColor }) => {
  const background = bgColor || ''
  return (
    <div {...attributes} {...styles.root} onClick={onClick} style={{
      background,
      cursor: onClick ? 'pointer' : 'default'
    }}>
      <div {...styles.textContainer}>
        <Text center color={color}>
          {children}
        </Text>
      </div>
    </div>
  )
}

TypoBlock.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  color: PropTypes.string,
  bgColor: PropTypes.string
}

export default TypoBlock
