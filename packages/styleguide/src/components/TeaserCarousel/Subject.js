import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifRegular16, sansSerifRegular18 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'

const styles = css({
  ...sansSerifRegular16,
  lineHeight: '22px',

  [mUp]: {
    ...sansSerifRegular18,
    lineHeight: '24px',
  },
})

const Subject = ({ children }) => {
  const [colorScheme] = useColorContext()
  const customStyles = css(styles, {
    '&::after': {
      content: ' ',
    },
  })
  return (
    <span {...customStyles} {...colorScheme.set('color', 'textSoft')}>
      {children}
    </span>
  )
}

export default Subject

Subject.propTypes = {
  children: PropTypes.node,
}
