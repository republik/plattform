import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import {
  serifTitle20,
  serifTitle22,
  sansSerifMedium20,
  sansSerifMedium22
} from '../Typography/styles'

const styles = {
  main: css({
    ...serifTitle20,
    '[data-interaction=true] > &': {
      ...sansSerifMedium20
    },
    margin: '0 0 6px 0',
    [mUp]: {
      ...serifTitle22,
      '[data-interaction=true] > &': {
        ...sansSerifMedium22,
        lineHeight: '24px'
      },
      margin: '0 0 8px 0'
    },
    color: colors.text,
    ':first-child': {
      marginTop: 0
    },
    ':last-child': {
      marginBottom: 0
    }
  })
}

const Headline = ({ children }) => {
  return <h1 {...styles.main}>{children}</h1>
}

Headline.propTypes = {
  children: PropTypes.node.isRequired
}

export default Headline
