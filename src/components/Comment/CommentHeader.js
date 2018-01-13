import React, { Fragment } from 'react'
import { css } from 'glamor'
import MdCheck from 'react-icons/lib/md/check'
import colors from '../../theme/colors'
import { sansSerifMedium16, sansSerifRegular14 } from '../Typography/styles'

import { ellipsize } from '../../lib/styleMixins'
import { timeFormat } from '../../lib/timeFormat'

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
    flexShrink: 0,
    flexGrow: 1,
    textAlign: 'right',
    paddingLeft: 5
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
  verifiedCheck: css({
    color: colors.text,
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: 4,
    marginTop: -2
  })
}

const defaultProfilePicture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAAAAACoWZBhAAAAF0lEQVQI12P4BAI/QICBFCaYBPNJYQIAkUZftTbC4sIAAAAASUVORK5CYII='

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')
const titleDate = string => dateTimeFormat(new Date(string))

export const CommentHeader = ({t, profilePicture, name, timeago, createdAt, updatedAt, credential}) => {
  const updated = updatedAt && updatedAt !== createdAt
  return (
    <div {...styles.root}>
      <img
        {...styles.profilePicture}
        src={profilePicture || defaultProfilePicture}
        alt=''
      />
      <div {...styles.meta}>
        <div {...styles.name}>
          <div {...styles.nameText}>{name}</div>
          {timeago && <span {...styles.timeago} title={titleDate(createdAt)}>
            {timeago(createdAt)}
          </span>}
        </div>
        {(credential || updated) && <div {...styles.description}>
          {credential && <Fragment>
            <div {...styles.descriptionText} style={{color: credential.verified ? colors.text : colors.lightText}}>
              {credential.description}
            </div>
            {credential.verified &&
              <MdCheck {...styles.verifiedCheck} />}
          </Fragment>}
          {updated && <span {...styles.timeago} title={titleDate(updatedAt)} style={{marginLeft: 15}}>
            {t('styleguide/comment/header/updated')}
          </span>}
        </div>}
      </div>
    </div>
  )
}

export default CommentHeader
