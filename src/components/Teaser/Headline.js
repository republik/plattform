import React from 'react'
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
  base: css({
    color: colors.text,
    margin: 0,
    marginBottom: 6,
    [mUp]: {
      marginBottom: 8,
    }
  }),
  editorial: css({
    ...serifTitle20,
    [mUp]: {
      ...serifTitle22,
    }
  }),
  interaction: css({
    ...sansSerifMedium20,
    [mUp]: {
      ...sansSerifMedium22,
      lineHeight: '24px'
    }
  })
}

export const Editorial = ({ children }) => 
  <h1 {...styles.base} {...styles.editorial}>{children}</h1>

export const Interaction = ({ children }) => 
  <h1 {...styles.base} {...styles.interaction}>{children}</h1>
