import React from 'react'
import { css } from 'glamor'
import MdCheck from 'react-icons/lib/md/check'
import colors from '../../../../theme/colors'
import { sansSerifMedium16, sansSerifRegular14 } from '../../../Typography/styles'
import { onlyS } from '../../../../theme/mediaQueries'

import { ellipsize, underline } from '../../../../lib/styleMixins'
import { timeFormat } from '../../../../lib/timeFormat'

import { DEFAULT_PROFILE_PICTURE } from '../../../Logo/BrandMark'
import { DiscussionContext } from '../../DiscussionContext'

export const profilePictureSize = 40
export const profilePictureMargin = 10

const buttonStyle = {
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  padding: '0',
  display: 'block',
  cursor: 'pointer'
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center'
  }),
  profilePicture: css({
    display: 'block',
    width: `40px`,
    flex: `0 0 40px`,
    height: `40px`,
    marginRight: '8px'
  }),
  center: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    minWidth: 0,
  }),
  name: css({
    ...sansSerifMedium16,
    lineHeight: '20px',
    color: colors.text,
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 1,
    ...ellipsize
  }),
  meta: css({
    ...sansSerifRegular14,
    lineHeight: '20px',
    color: colors.lightText,
    display: 'flex',
    alignItems: 'center'
  }),
  credential: css({
    display: 'flex',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0
  }),
  credentialVerified: css({
    color: colors.text
  }),
  descriptionText: css({
    ...ellipsize
  }),
  verifiedCheck: css({
    color: colors.primary,
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: 4,
    marginTop: -2
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  }),
  linkUnderline: css({
    color: 'inherit',
    textDecoration: 'none',
    ':hover': {
      ...underline
    }
  }),
  timeago: css({
    color: colors.lightText,
    flexShrink: 0,
    flexGrow: 0,
    whiteSpace: 'pre'
  }),
  replies: css({
    display: 'inline-block',
    paddingLeft: '16px',
    marginRigth: '-4px',
    whiteSpace: 'pre',
    verticalAlign: 'middle',
    [onlyS]: {
      display: 'none'
    }
  }),
  action: css({
    ...buttonStyle,
    ...sansSerifRegular14,
    color: colors.lightText,
    flexShrink: 0,
    height: '40px',
    cursor: 'pointer',
    '&:hover': {
      color: colors.text
    },
    '& svg': {
      display: 'inline-block',
      margin: '12px',
      verticalAlign: 'middle'
    }
  })
}

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')
const titleDate = string => dateTimeFormat(new Date(string))

const DefaultLink = ({ children }) => children

export const Header = ({ t, comment, isExpanded, onToggle }) => {
  const { discussion, clock, links } = React.useContext(DiscussionContext)

  const { displayAuthor, updatedAt, createdAt, comments } = comment
  const { profilePicture, name, credential } = displayAuthor
  const isUpdated = updatedAt && updatedAt !== createdAt

  return (
    <div {...styles.root}>
      <links.Profile displayAuthor={displayAuthor} passHref>
        <a {...styles.link}>
          <img {...styles.profilePicture} src={profilePicture || DEFAULT_PROFILE_PICTURE} alt='' />
        </a>
      </links.Profile>
      <div {...styles.center}>
        <links.Profile displayAuthor={displayAuthor} passHref>
          <a {...styles.name}>{name}</a>
        </links.Profile>
        <div {...styles.meta}>
          {credential && <div {...styles.credential} title={credential.verified ? t('styleguide/comment/header/verifiedCredential', undefined, '') : undefined}>
            <div {...styles.descriptionText} style={{ color: credential.verified ? colors.text : colors.lightText }}>
              {credential.description}
            </div>
            {credential.verified && <MdCheck {...styles.verifiedCheck} />}
          </div>}
          {credential && <div style={{ whiteSpace: 'pre' }}>{' · '}</div>}
          <div {...styles.timeago} title={titleDate(createdAt)}>
            <links.Comment comment={comment} passHref>
              <a {...styles.linkUnderline}>{clock.formatTimeRelative(new Date(createdAt))}</a>
            </links.Comment>
          </div>
          {isUpdated && <div {...styles.timeago} title={titleDate(updatedAt)}>
            {' · '}{t('styleguide/comment/header/updated')}
          </div>}
        </div>
      </div>
      {onToggle && (
        <button {...styles.action} onClick={onToggle}>
          {(!isExpanded && comments && comments.totalCount > 0) && (
            <div {...styles.replies}>
              {t.pluralize('styleguide/comment/header/replies', { count: comments.totalCount })}
            </div>
          )}
          {isExpanded ? <IcCollapse /> : <IcExpand />}
        </button>
      )}
    </div>
  )
}

const IcExpand = () => (
  <svg width="16px" height="16px" viewBox="0 0 16 16">
    <path d="M8,0 V16 M0,8 H16" strokeWidth="2" stroke="currentColor" />
  </svg>
)

const IcCollapse = () => (
  <svg width="16px" height="16px" viewBox="0 0 16 16">
    <path d="M0,8 H16" strokeWidth="2" stroke="currentColor" />
  </svg>
)
