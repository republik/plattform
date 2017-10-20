import React from 'react'
import {css} from 'glamor'
import colors from '../../theme/colors'
import {serifRegular16} from '../Typography/styles'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    background: colors.whiteSmoke,
    padding: '12px',
    height: '64px',
    cursor: 'pointer'
  }),
  profilePicture: css({
    display: 'block',
    width: '40px',
    height: '40px',
    marginRight: 10
  }),
  meta: css({
    ...serifRegular16,
    color: colors.lightText,
    flex: 1,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  })
}

const CommentComposerPlaceholder = ({t, profilePicture, onClick}) => (
  <div {...styles.root} onClick={onClick}>
    {profilePicture && <img
      {...styles.profilePicture}
      src={profilePicture}
      alt=''
    />}
    <div {...styles.meta}>
      {t('components/CommentComposer/CommentComposerPlaceholder/teaser')}
    </div>
  </div>
)

export default CommentComposerPlaceholder
