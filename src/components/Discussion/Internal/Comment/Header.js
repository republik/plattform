import React from 'react'
import { css } from 'glamor'
import MdCheck from 'react-icons/lib/md/check'
import colors from '../../../../theme/colors'
import {
  sansSerifMedium16,
  sansSerifRegular14
} from '../../../Typography/styles'
import { onlyS } from '../../../../theme/mediaQueries'

import { ellipsize, underline } from '../../../../lib/styleMixins'
import { timeFormat } from '../../../../lib/timeFormat'

import { DiscussionContext, formatTimeRelative } from '../../DiscussionContext'
import * as config from '../../config'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'

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

/**
 * This style is exported so that <CommentNode> can control the visibility
 * of this action button on hover over the whole comment element.
 */
export const headerActionStyle = ({ isExpanded }) =>
  css({
    ...buttonStyle,
    ...convertStyleToRem(sansSerifRegular14),
    color: isExpanded ? colors.divider : colors.lightText,
    flexShrink: 0,
    height: pxToRem('40px'),
    cursor: 'pointer',
    '@media (hover)': {
      ':hover': {
        color: colors.text
      }
    },
    '& svg': {
      display: 'inline-block',
      margin: '10px',
      verticalAlign: 'middle'
    },
    marginRight: -10
  })

const styles = {
  root: ({ isExpanded }) =>
    css({
      display: 'flex',
      alignItems: 'center'
    }),
  profilePicture: css({
    display: 'block',
    width: pxToRem(40),
    flex: `0 0 ${pxToRem(40)}`,
    height: pxToRem(40),
    marginRight: pxToRem(8)
  }),
  indentIndicators: css({
    flexShrink: 0,
    marginRight: pxToRem(8 - 4),
    display: 'flex'
  }),
  indentIndicator: css({
    width: pxToRem(4 + config.verticalLineWidth),
    height: pxToRem(40),
    borderLeft: `${pxToRem(config.verticalLineWidth)} solid ${colors.divider}`
  }),
  center: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    minWidth: 0
  }),
  name: css({
    ...convertStyleToRem(sansSerifMedium16),
    lineHeight: pxToRem(20),
    color: colors.text,
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 1,
    textDecoration: 'none',
    ...ellipsize,

    /*
     * Add hover effect only if the element has a href attribute. We always
     * render the name as a <a> tag, but if it's not a public profile then
     * we don't set a href attribute.
     */
    '@media (hover)': {
      '[href]:hover': {
        ...underline
      }
    }
  }),
  meta: css({
    ...convertStyleToRem(sansSerifRegular14),
    lineHeight: pxToRem(20),
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
    marginLeft: pxToRem(4),
    marginTop: pxToRem(-2)
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  }),
  linkUnderline: css({
    color: 'inherit',
    textDecoration: 'none',
    '@media (hover)': {
      ':hover': {
        ...underline
      }
    }
  }),
  timeago: css({
    color: colors.lightText,
    flexShrink: 0,
    flexGrow: 0,
    whiteSpace: 'pre'
  }),
  expandCount: css({
    display: 'inline-block',
    paddingLeft: pxToRem(16),
    marginRigth: pxToRem(-4),
    whiteSpace: 'pre',
    verticalAlign: 'middle',
    [onlyS]: {
      display: 'none'
    }
  })
}

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')
const titleDate = string => dateTimeFormat(new Date(string))

export const Header = ({ t, comment, isExpanded, onToggle }) => {
  const { clock, links } = React.useContext(DiscussionContext)

  const {
    displayAuthor,
    updatedAt,
    createdAt,
    comments,
    parentIds = []
  } = comment
  const { profilePicture, name, credential } = displayAuthor || {}

  const isUpdated = updatedAt && updatedAt !== createdAt

  return (
    <div {...styles.root({ isExpanded })}>
      {(() => {
        const n = parentIds.length - config.nestLimit
        if (n < 0) {
          if (!profilePicture) {
            return null
          }
          return (
            <links.Profile displayAuthor={displayAuthor} passHref>
              <a {...styles.link}>
                <img {...styles.profilePicture} src={profilePicture} alt='' />
              </a>
            </links.Profile>
          )
        } else if (n === 0) {
          return null
        } else {
          return (
            <div {...styles.indentIndicators}>
              {Array.from({ length: n }).map((_, i) => (
                <div key={i} {...styles.indentIndicator} />
              ))}
            </div>
          )
        }
      })()}
      <div {...styles.center}>
        <links.Profile displayAuthor={displayAuthor} passHref>
          <a {...styles.name}>{name}</a>
        </links.Profile>
        <div {...styles.meta}>
          {credential && (
            <div
              {...styles.credential}
              title={
                credential.verified
                  ? t(
                      'styleguide/comment/header/verifiedCredential',
                      undefined,
                      ''
                    )
                  : undefined
              }
            >
              <div
                {...styles.descriptionText}
                style={{
                  color: credential.verified ? colors.text : colors.lightText
                }}
              >
                {credential.description}
              </div>
              {credential.verified && <MdCheck {...styles.verifiedCheck} />}
            </div>
          )}
          {credential && <div style={{ whiteSpace: 'pre' }}>{' · '}</div>}
          <div {...styles.timeago} title={titleDate(createdAt)}>
            <links.Comment comment={comment} passHref>
              <a {...styles.linkUnderline} suppressHydrationWarning>
                {formatTimeRelative(new Date(createdAt), {
                  ...clock,
                  direction: 'past'
                })}
              </a>
            </links.Comment>
          </div>
          {isUpdated && (
            <div {...styles.timeago} title={titleDate(updatedAt)}>
              {' · '}
              {t('styleguide/comment/header/updated')}
            </div>
          )}
        </div>
      </div>
      {onToggle && (
        <button {...headerActionStyle({ isExpanded })} onClick={onToggle}>
          {!isExpanded && comments && comments.totalCount > 0 && (
            <div {...styles.expandCount}>
              {t.pluralize('styleguide/comment/header/expandCount', {
                count: comments.totalCount + 1
              })}
            </div>
          )}
          {isExpanded ? <IcCollapse /> : <IcExpand />}
        </button>
      )}
    </div>
  )
}

const IcExpand = () => (
  <svg width='20px' height='20px' viewBox='0 0 20 20'>
    <rect
      stroke='currentColor'
      strokeWidth='2'
      fill='white'
      x='1'
      y='1'
      width='18'
      height='18'
    />
    <rect fill='currentColor' x='9' y='6' width='2' height='8' />
    <rect fill='currentColor' x='6' y='9' width='8' height='2' />
  </svg>
)

const IcCollapse = () => (
  <svg width='20px' height='20px' viewBox='0 0 20 20'>
    <rect
      stroke='currentColor'
      strokeWidth='2'
      fill='white'
      x='1'
      y='1'
      width='18'
      height='18'
    />
    <rect fill='currentColor' x='6' y='9' width='8' height='2' />
  </svg>
)
