import React from 'react'
import PropTypes from 'prop-types'
import {
  sansSerifRegular15,
  sansSerifRegular18
} from '../Typography/styles'
import colors from '../../theme/colors'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'

const WIDTH = 22

const styles = {
  li: css({
    color: colors.text,
    paddingLeft: `${WIDTH}px`,
    position: 'relative',
    ...sansSerifRegular15,
    [mUp]: {
      ...sansSerifRegular18
    },
    '& p:last-child': {
      marginBottom: 0
    }
  })
}


const ListItem = ({ children, attributes = {}, style={} }) => (
  <li {...styles.li} {...attributes} {...textAttributes} style={style}>
    {children}
  </li>
)

ListItem.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  style: PropTypes.object
}

export default ListItem
