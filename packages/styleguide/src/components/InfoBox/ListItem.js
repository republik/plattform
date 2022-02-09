import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const WIDTH = 22

const styles = {
  li: css({
    paddingLeft: `${WIDTH}px`,
    position: 'relative',
    ...convertStyleToRem(sansSerifRegular15),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular18),
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  }),
}

const ListItem = ({ children, attributes = {}, style = {} }) => {
  const [colorScheme] = useColorContext()
  return (
    <li
      {...styles.li}
      {...colorScheme.set('color', 'text')}
      {...attributes}
      {...textAttributes}
      style={style}
    >
      {children}
    </li>
  )
}

ListItem.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  style: PropTypes.object,
}

export default ListItem
