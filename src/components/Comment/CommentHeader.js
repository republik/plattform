import React from 'react'
import {css} from 'glamor'
import {MdCheck} from 'react-icons/lib/md'
import colors from '../../theme/colors'
import {sansSerifMedium16, sansSerifRegular14} from '../Typography/styles'
import {ellipsize} from '../../lib/styleMixins'

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
    flexGrow: 0,
    flexShrink: 0,
    height: `${profilePictureSize + 2 * profilePictureBorderSize}px`,
    margin: `${-profilePictureBorderSize}px ${-profilePictureBorderSize + profilePictureMargin}px ${-profilePictureBorderSize}px ${-profilePictureBorderSize}px`,
    border: `${profilePictureBorderSize}px solid white`
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: `calc(100% - ${profilePictureSize + profilePictureMargin}px)`
  }),
  name: css({
    ...sansSerifMedium16,
    lineHeight: '20px',
    color: colors.text,
    display: 'flex',
    alignItems: 'center'
  }),
  nameText: css({
    ...ellipsize
  }),
  timeago: css({
    ...sansSerifRegular14,
    lineHeight: '20px',
    color: colors.lightText,
    flexShrink: 0
  }),
  description: css({
    ...sansSerifRegular14,
    lineHeight: '20px',
    color: colors.lightText,
    display: 'flex',
    alignItems: 'center'
  }),
  descriptionText: css({
    ...ellipsize,
  }),
  verifiedDescription: css({
    color: colors.text
  }),
  verifiedCheck: css({
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: 4,
    marginTop: -2
  })
}

const defaultProfilePicture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAAAAACoWZBhAAAAF0lEQVQI12P4BAI/QICBFCaYBPNJYQIAkUZftTbC4sIAAAAASUVORK5CYII='

export const CommentHeader = ({t, profilePicture, name, timeago, credential}) => (
  <div {...styles.root}>
    <img
      {...styles.profilePicture}
      src={profilePicture || defaultProfilePicture}
      alt=''
    />
    <div {...styles.meta}>
      <div {...styles.name}>
        <div {...styles.nameText}>{name}</div>
        {timeago && <span {...styles.timeago}>・{timeago}</span>}
      </div>
      {credential && <div {...styles.description} {...(credential.verified ? styles.verifiedDescription : {})}>
        <div {...styles.descriptionText} >{credential.description}</div>
        {credential.verified && <MdCheck {...styles.verifiedCheck} />}
      </div>}
    </div>
  </div>
)

export default CommentHeader
