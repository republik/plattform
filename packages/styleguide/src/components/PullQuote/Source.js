import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  cite: css({
    display: 'block',
    ...convertStyleToRem(sansSerifRegular14),
    marginTop: '18px',
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15),
      marginTop: '21px',
    },
    fontStyle: 'normal',
  }),
}

export const Source = ({ children, attributes }) => {
  const [colorScheme] = useColorContext()
  return (
    <cite
      {...styles.cite}
      {...attributes}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </cite>
  )
}

Source.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
}

export default Source
