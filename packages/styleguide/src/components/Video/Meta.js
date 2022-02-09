import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { VimeoIcon, YoutubeIcon } from '../Icons'
import colors from '../../theme/colors'
import { sansSerifMedium16, sansSerifRegular14 } from '../Typography/styles'
import { ellipsize } from '../../lib/styleMixins'
import { timeFormat } from '../../lib/timeFormat'

export const profilePictureSize = 40
export const profilePictureMargin = 10
const profilePictureBorderSize = 5

const styles = {
  root: css({
    borderBottom: `1px solid ${colors.text}`,
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
    position: 'relative',
    paddingBottom: '10px',
  }),
  profilePicture: css({
    display: 'block',
    width: `${profilePictureSize + 2 * profilePictureBorderSize}px`,
    flexGrow: 0,
    flexShrink: 0,
    height: `${profilePictureSize + 2 * profilePictureBorderSize}px`,
    margin: `${-profilePictureBorderSize}px ${
      -profilePictureBorderSize + profilePictureMargin
    }px ${-profilePictureBorderSize}px ${-profilePictureBorderSize}px`,
    border: `${profilePictureBorderSize}px solid white`,
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: `calc(100% - ${profilePictureSize + profilePictureMargin}px)`,
  }),
  name: css({
    ...sansSerifMedium16,
    lineHeight: '20px',
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    paddingRight: '15px',
  }),
  nameText: css({
    ...ellipsize,
  }),
  subline: css({
    ...sansSerifRegular14,
    lineHeight: '20px',
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
  }),
  sublineText: css({
    ...ellipsize,
  }),
  icon: css({
    color: '#CDCDCD',
    position: 'absolute',
    right: 0,
    top: '8px',
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: 4,
    fontSize: '24px',
  }),
  link: css({
    textDecoration: 'none',
    color: colors.text,
    '@media (hover)': {
      ':hover': {
        color: colors.lightText,
      },
    },
  }),
}

const dateFormat = timeFormat('%d. %B %Y')

const ICON = {
  vimeo: VimeoIcon,
  youtube: YoutubeIcon,
}

const Link = ({ href, children }) => (
  <a href={href} {...styles.link}>
    {children}
  </a>
)

export const Meta = ({
  url,
  platform,
  title,
  userName,
  userUrl,
  userProfileImageUrl,
  date,
}) => {
  const Icon = ICON[platform]
  return (
    <div {...styles.root}>
      <Link href={userUrl}>
        <img {...styles.profilePicture} src={userProfileImageUrl} alt='' />
      </Link>
      <Link href={url}>
        <Icon {...styles.icon} />
      </Link>
      <div {...styles.meta}>
        <div {...styles.name}>
          <div {...styles.nameText}>
            <Link href={userUrl}>{userName}</Link>
          </div>
        </div>
        <div {...styles.subline}>
          <div {...styles.sublineText}>
            <Link href={url}>{dateFormat(date)}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

Meta.propTypes = {
  url: PropTypes.string.isRequired,
  platform: PropTypes.oneOf(['vimeo', 'youtube']).isRequired,
  title: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userUrl: PropTypes.string.isRequired,
  userProfileImageUrl: PropTypes.string.isRequired,
  date: PropTypes.object.isRequired,
}

Meta.defaultProps = {
  platform: 'youtube',
}

export default Meta
