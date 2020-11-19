import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { sansSerifMedium14 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import CarouselContext, { defaultValue } from './Context'

const styles = css({
  ...sansSerifMedium14,
  margin: '0 0 10px 0'
})

const Format = ({ children, color }) => {
  const context = React.useContext(CarouselContext)
  const textColor = color || context.color
  const mapping = textColor === defaultValue.color ? 'format' : undefined
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
  color: PropTypes.string
}
