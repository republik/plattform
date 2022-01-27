import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifRegular12, sansSerifRegular13 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  label: css({
    ...convertStyleToRem(sansSerifRegular12),
    color: colors.disabled,
    position: 'absolute',
    top: '-20px',
    right: 0,
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular13)
    }
  })
}

const InternalOnlyTag = ({ t }) => {
  return (
    <div {...styles.label}>
      {t ? t('styleguide/TeaserFeed/InternalOnlyTag') : 'Internal'}
    </div>
  )
}

export default InternalOnlyTag
