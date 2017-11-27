import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import Text from './Text'

const styles = {
  root: css({
    margin: 0
  }),
  textContainer: css({
    margin: '0 auto',
    padding: '15px',
    [mUp]: {
      maxWidth: '70%',
      padding: '30px 0'
    },
    [tUp]: {
      padding: '50px 0'
    }
  })
}

const TypoBlock = ({ children, attributes, color, bgColor }) => {
  const background = bgColor || ''
  return (
    <div {...attributes} {...styles.root} style={{ background }}>
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
