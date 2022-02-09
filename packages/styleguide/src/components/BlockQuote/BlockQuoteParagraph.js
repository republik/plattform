import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'
import { fontRule } from '../Typography/Interaction'
import { sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  quote: css({
    margin: 0,
    padding: '0 15px 12px 15px',
    fontSize: '15px',
    ...convertStyleToRem(sansSerifRegular15),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular18),
      padding: '0 25px 20px 25px',
      '&:first-child': {
        paddingTop: '20px',
      },
    },
    '&:first-child': {
      paddingTop: '12px',
    },
  }),
}

const BlockQuoteParagraph = ({ children, attributes }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...styles.quote}
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('backgroundColor', 'hover')}
      {...fontRule}
    >
      {children}
    </p>
  )
}

BlockQuoteParagraph.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
}

export default BlockQuoteParagraph
