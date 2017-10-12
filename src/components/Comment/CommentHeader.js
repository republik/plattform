import React from 'react'
import {css} from 'glamor'
import {MdCheck} from 'react-icons/lib/md'
import colors from '../../theme/colors'
import {fontFamilies} from '../../theme/fonts'
import {sansSerifMedium16, sansSerifRegular14} from '../Typography/styles'

const commentHeaderStyles = {
  root: css({
    display: 'flex',
    alignItems: 'center'
  }),
  profilePicture: css({
    display: 'block',
    width: '40px',
    height: '40px',
    marginRight: 10
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }),
  name: css({
    ...sansSerifMedium16,
    color: colors.text
  }),
  timeago: css({
    ...sansSerifRegular14,
    color: '#979797' // TODO: colors.lightText
  }),
  description: css({
    ...sansSerifRegular14,
    color: '#979797' // TODO: colors.lightText
  }),
  verifiedDescription: css({
    color: colors.text
  }),
  verifiedCheck: css({
    display: 'inline-block',
    marginLeft: 4,
    marginTop: -2
  })
}

export const CommentHeader = ({profilePicture, name, timeago, credential}) => (
  <div {...commentHeaderStyles.root}>
    {profilePicture && <img
      {...commentHeaderStyles.profilePicture}
      src={profilePicture}
    />}
    <div {...commentHeaderStyles.meta}>
      <div {...commentHeaderStyles.name}>
        {name}
        {timeago && <span {...commentHeaderStyles.timeago}>・{timeago}</span>}
      </div>
      {credential && <div {...commentHeaderStyles.description} {...(credential.verified ? commentHeaderStyles.verifiedDescription : {})}>
        {credential.description}
        {credential.verified && <MdCheck {...commentHeaderStyles.verifiedCheck} />}
      </div>}
    </div>
  </div>
)

export default CommentHeader
