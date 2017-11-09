import React from 'react'
import {css} from 'glamor'
import {MdCheck} from 'react-icons/lib/md'
import colors from '../../theme/colors'
import {sansSerifMedium16, sansSerifRegular14} from '../Typography/styles'

export const profilePictureSize = 40
export const profilePictureMargin = 10
const profilePictureBorderSize = 5

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center'
  }),
  profilePicture: css({
    display: 'block',
    width: `${profilePictureSize + 2 * profilePictureBorderSize}px`,
    height: `${profilePictureSize + 2 * profilePictureBorderSize}px`,
    margin: `${-profilePictureBorderSize}px ${-profilePictureBorderSize + profilePictureMargin}px ${-profilePictureBorderSize}px ${-profilePictureBorderSize}px`,
    border: `${profilePictureBorderSize}px solid white`
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }),
  name: css({
    ...sansSerifMedium16,
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }),
  timeago: css({
    ...sansSerifRegular14,
    color: colors.lightText,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }),
  description: css({
    ...sansSerifRegular14,
    lineHeight: 1,
    color: colors.lightText
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

export const CommentHeader = ({t, profilePicture, name, timeago, credential}) => (
  <div {...styles.root}>
    {profilePicture && <img
      {...styles.profilePicture}
      src={profilePicture}
      alt=''
    />}
    <div {...styles.meta}>
      <div {...styles.name}>
        {name}
        {timeago && <span {...styles.timeago}>・{timeago}</span>}
      </div>
      {credential && <div {...styles.description} {...(credential.verified ? styles.verifiedDescription : {})}>
        {credential.description}
        {credential.verified && <MdCheck {...styles.verifiedCheck} />}
      </div>}
    </div>
  </div>
)

export default CommentHeader
