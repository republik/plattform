import React from 'react'
import { css } from 'glamor'
import { AddIcon, CheckIcon, RemoveIcon } from '../../../Icons'
import {
  sansSerifMedium16,
  sansSerifRegular14
} from '../../../Typography/styles'
import { onlyS } from '../../../../theme/mediaQueries'
import { ellipsize, underline } from '../../../../lib/styleMixins'
import { timeFormat } from '../../../../lib/timeFormat'
import { DiscussionContext } from '../../DiscussionContext'
import * as config from '../../config'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import { useColorContext } from '../../../Colors/ColorContext'
import IconButton from '../../../IconButton'

import RelativeTime from './RelativeTime'
import ActionsMenu, { ActionsMenuItemPropType } from './ActionsMenu'
import PropTypes from 'prop-types'

export const profilePictureSize = 40
export const profilePictureMargin = 10

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
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
    marginRight: pxToRem(-4),
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
    justifyContent: 'space-between',
    flexShrink: 0,
    height: pxToRem('40px'),
    '& > *:not(:last-child)': {
      marginRight: 8
    }
  }),
  collapseWrapper: css({
    display: 'block'
  })
}

/**
 * This glamor rule is exported so that <CommentNode> can control the visibility
 * of this action button on hover over the whole comment element.
 */
export const collapseWrapperRule = styles.collapseWrapper

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')
const titleDate = string => dateTimeFormat(new Date(string))

export const Header = ({ t, comment, menuItems, isExpanded, onToggle }) => {
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
        <div {...styles.name} {...colorScheme.set('color', 'text')}>
          {!published && (
            <span {...colorScheme.set('color', 'textSoft')}>
              {adminUnpublished
                ? t('styleguide/comment/header/unpublishedByAdmin')
                : unavailable
                ? t('styleguide/comment/header/unavailable')
                : t('styleguide/comment/header/unpublishedByUser')}
            </span>
          )}
          {published && (
            <Link displayAuthor={displayAuthor} passHref>
              <a {...styles.linkUnderline}>
                {name}
              </a>
            </Link>
          )}
        </div>
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
      <div {...styles.actionsWrapper} className={styles.actionsWrapper}>
        {onToggle && (
          <div className={styles.collapseWrapper}>
            <IconButton
              invert={true}
              Icon={isExpanded ? RemoveIcon : AddIcon}
              fillColorName='textSoft'
              size={20}
              onClick={onToggle}
              style={{
                marginLeft: 10
              }}
              label={
                !isExpanded &&
                t.pluralize('styleguide/comment/header/expandCount', {
                  count: comments.totalCount + 1
                })
              }
            />
          </div>
        )}
        {menuItems && menuItems.length > 0 && <ActionsMenu items={menuItems} />}
      </div>
    </div>
  )
}

Header.propTypes = {
  t: PropTypes.func.isRequired,
  comment: PropTypes.object.isRequired,
  menuItems: PropTypes.arrayOf(ActionsMenuItemPropType),
  isExpanded: PropTypes.bool,
  onToggle: PropTypes.func
}
