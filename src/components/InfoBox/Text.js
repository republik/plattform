import React from 'react'
import PropTypes from 'prop-types'
import { fontRule } from '../Typography/Interaction'
import { sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  text: css({
    ...convertStyleToRem(sansSerifRegular15),
    lineHeight: pxToRem('24px'),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular18)
    },
    ':nth-of-type(2)': {
      marginTop: 0
    }
  })
}

export const Text = ({ children, attributes }) => {
  const [colorScheme] = useColorContext()
  const colors = css({
    color: colorScheme.text
  })
  return (
    <p
      {...attributes}
      {...textAttributes}
      {...styles.text}
      {...colors}
      {...fontRule}
    >
      {children}
    </p>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Text
