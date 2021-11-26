import React, { useMemo } from 'react'
import { css } from 'glamor'
import {
  CheckIcon,
  MoreIcon,
  UnfoldLessIcon,
  UnfoldMoreIcon
} from '../../../Icons'
import {
  sansSerifMedium16,
  sansSerifRegular14
} from '../../../Typography/styles'
import { mUp, onlyS } from '../../../../theme/mediaQueries'

import { ellipsize, underline } from '../../../../lib/styleMixins'
import { timeFormat } from '../../../../lib/timeFormat'
import { DiscussionContext } from '../../DiscussionContext'
import * as config from '../../config'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import CalloutMenu from '../../../Callout/CalloutMenu'
import { useColorContext } from '../../../Colors/ColorContext'
import IconButton from '../../../IconButton'

import RelativeTime from './RelativeTime'

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
    flexShrink: 0,
    height: pxToRem('40px'),
    cursor: 'pointer',
    '& svg': {
      display: 'inline-block',
      margin: '10px',
      verticalAlign: 'middle'
    },
    marginRight: -10
  })

const styles = {
  root: css({
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
    borderLeftWidth: pxToRem(config.verticalLineWidth),
    borderLeftStyle: 'solid'
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
  descriptionText: css({
    ...ellipsize
  }),
  verifiedCheck: css({
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: pxToRem(4),
    marginTop: pxToRem(2)
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
  }),
  actionsWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  })
}

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')
const titleDate = string => dateTimeFormat(new Date(string))
const MoreIconWithProps = props => (
  <IconButton title='Mehr' Icon={MoreIcon} {...props} />
)

export const Header = ({ t, comment, menu, isExpanded, onToggle }) => {
  const { clock, discussion, Link } = React.useContext(DiscussionContext)

  const [colorScheme] = useColorContext()
  const {
    displayAuthor,
    updatedAt,
    createdAt,
    published = true,
    adminUnpublished = false,
    unavailable,
    comments,
    parentIds = []
  } = comment
  const { profilePicture, name, credential } = displayAuthor || {}

  const isUpdated = updatedAt && updatedAt !== createdAt

  return (
    <div {...styles.root}>
      {(() => {
        const n = parentIds.length - config.nestLimit
        if (n < 0) {
          if (!profilePicture || !published) {
            return null
          }
          return (
            <Link displayAuthor={displayAuthor} passHref>
              <a {...styles.link}>
                <img {...styles.profilePicture} src={profilePicture} alt='' />
              </a>
            </Link>
          )
        } else if (n === 0) {
          return null
        } else {
          return (
            <div {...styles.indentIndicators}>
              {Array.from({ length: n }).map((_, i) => (
                <div
                  key={i}
                  {...styles.indentIndicator}
                  {...colorScheme.set('borderColor', 'divider')}
                />
              ))}
            </div>
          )
        }
      })()}
      <div {...styles.center}>
        {!published && (
          <div {...styles.name} {...colorScheme.set('color', 'textSoft')}>
            {adminUnpublished
              ? t('styleguide/comment/header/unpublishedByAdmin')
              : unavailable
              ? t('styleguide/comment/header/unavailable')
              : t('styleguide/comment/header/unpublishedByUser')}
          </div>
        )}
        {published && (
          <Link displayAuthor={displayAuthor} passHref>
            <a {...styles.name} {...colorScheme.set('color', 'text')}>
              {name}
            </a>
          </Link>
        )}
        <div {...styles.meta} {...colorScheme.set('color', 'textSoft')}>
          {published && credential && (
            <>
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
                  {...colorScheme.set(
                    'color',
                    credential.verified ? 'text' : 'textSoft'
                  )}
                >
                  {credential.description}
                </div>
                {credential.verified && (
                  <CheckIcon
                    {...styles.verifiedCheck}
                    {...colorScheme.set('color', 'primary')}
                  />
                )}
              </div>
              <div style={{ whiteSpace: 'pre' }}>{' · '}</div>
            </>
          )}
          <div
            {...styles.timeago}
            {...colorScheme.set('color', 'textSoft')}
            title={titleDate(createdAt)}
          >
            <Link discussion={discussion} comment={comment} passHref>
              <a {...styles.linkUnderline}>
                <RelativeTime {...clock} date={createdAt} />
              </a>
            </Link>
          </div>
          {published && isUpdated && (
            <div
              {...styles.timeago}
              {...colorScheme.set('color', 'textSoft')}
              title={titleDate(updatedAt)}
            >
              {' · '}
              {t('styleguide/comment/header/updated')}
            </div>
          )}
        </div>
      </div>
      <div {...styles.actionsWrapper}>
        {onToggle && (
          <IconButton
            invert={true}
            Icon={isExpanded ? UnfoldLessIcon : UnfoldMoreIcon}
            onClick={onToggle}
            label={
              !isExpanded &&
              t.pluralize('styleguide/comment/header/expandCount', {
                count: comments.totalCount + 1
              })
            }
            labelShort={
              !isExpanded &&
              t.pluralize('styleguide/comment/header/expandCount', {
                count: comments.totalCount + 1
              })
            }
            noMargin
          />
        )}
        {menu && (
          <div>
            <CalloutMenu
              contentPaddingMobile={'30px'}
              Element={MoreIconWithProps}
              align='right'
            >
              {menu}
            </CalloutMenu>
          </div>
        )}
      </div>
    </div>
  )
}
