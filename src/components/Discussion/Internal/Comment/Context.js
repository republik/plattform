import React from 'react'
import { css } from 'glamor'
import colors from '../../../../theme/colors'
import { ellipsize } from '../../../../lib/styleMixins'
import { mUp } from '../../../../theme/mediaQueries'
import {
  sansSerifMedium14,
  sansSerifMedium16,
  sansSerifRegular14
} from '../../../Typography/styles'
import { convertStyleToRem } from '../../../Typography/utils'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center'
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%'
  }),
  title: css({
    ...ellipsize,
    ...convertStyleToRem(sansSerifMedium14),
    color: colors.text,
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium16),
      lineHeight: '20px'
    }
  }),
  description: css({
    ...ellipsize,
    ...convertStyleToRem(sansSerifRegular14),
    color: colors.text
  })
}

export const Context = ({ title, description }) => (
  <div {...styles.root}>
    <div {...styles.meta}>
      <div {...styles.title}>{title}</div>
      {description && <div {...styles.description}>{description}</div>}
    </div>
  </div>
)
