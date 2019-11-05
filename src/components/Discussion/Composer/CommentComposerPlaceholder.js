import React from 'react'
import { css } from 'glamor'
import colors from '../../../theme/colors'
import { serifRegular16 } from '../../Typography/styles'
import { convertStyleToRem, pxToRem } from '../../Typography/utils'

const styles = {
  root: css({
    ...convertStyleToRem(serifRegular16),
    color: colors.lightText,
    display: 'flex',
    alignItems: 'center',
    background: colors.secondaryBg,
    padding: '8px',
    height: pxToRem('56px'),
    cursor: 'pointer',
    '@media (hover)': {
      ':hover': {
        color: colors.text
      }
    }
  }),
  profilePicture: css({
    display: 'block',
    width: pxToRem('40px'),
    height: pxToRem('40px'),
    marginRight: '8px'
  }),
  meta: css({
    flex: 1,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0
  })
}

export const CommentComposerPlaceholder = ({ t, displayAuthor, onClick }) => (
  <div {...styles.root} onClick={onClick}>
    {displayAuthor.profilePicture && (
      <img
        {...styles.profilePicture}
        src={displayAuthor.profilePicture}
        alt=''
      />
    )}
    <div {...styles.meta}>{t('styleguide/CommentComposer/placeholder')}</div>
  </div>
)
