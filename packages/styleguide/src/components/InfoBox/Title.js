import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifMedium16, sansSerifMedium19 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  text: css({
    margin: '0 0 8px 0',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    ...convertStyleToRem(sansSerifMedium16),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium19),
      margin: '0 0 12px 0',
    },
  }),
}

export const Title = ({ children, attributes }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...textAttributes}
      {...styles.text}
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('borderColor', 'text')}
    >
      {children}
    </p>
  )
}

Title.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
}

export default Title
