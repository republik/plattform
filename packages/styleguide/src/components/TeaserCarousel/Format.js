import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { sansSerifMedium14 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import CarouselContext, { defaultValue } from './Context'

const styles = css({
  ...sansSerifMedium14,
  position: 'relative', // make sure Format link is on top of the teaser link overlay
  zIndex: 1, // ditto
  margin: '0 0 10px 0',
})

const Format = ({ children, color }) => {
  const context = React.useContext(CarouselContext)
  const mapping = context.color === defaultValue.color ? 'format' : undefined
  const textColor = color || context.color
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('color', textColor, mapping)} {...styles}>
      {children}
    </div>
  )
}

export default Format

Format.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
}
