import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifRegular12, sansSerifRegular13 } from '../Typography/styles'

const styles = {
  label: css({
    ...sansSerifRegular12,
    color: colors.disabled,
    position: 'absolute',
    top: '-20px',
    right: 0,
    [mUp]: {
      ...sansSerifRegular13
    }
  })
}

const InternalOnlyTag = ({ t }) => {
  if (!t) {
    return null
  }
  return (
    <div {...styles.label}>
      {t('styleguide/TeaserFeed/InternalOnlyTag')}
    </div>
  )
}

export default InternalOnlyTag
