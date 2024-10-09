import React, {
  ComponentPropsWithoutRef,
  ComponentType,
  useContext,
} from 'react'
import { css } from 'glamor'
import { sansSerifMedium16 } from '../../../Typography/styles'
import { ellipsize, underline } from '../../../../lib/styleMixins'
import * as config from '../../config'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import { useColorContext } from '../../../Colors/ColorContext'
import IconButton from '../../../IconButton'

import ActionsMenu from './ActionsMenu'
import HeaderMetaLine from './HeaderMetaLine'
import { DiscussionContext } from '../../DiscussionContext'
import { IconAdd, IconRemove } from '@republik/icons'
import { CommentLinkProps, DefaultCommentLink } from './CommentLink'
import { Formatter } from '../../../../lib/translate'
import { Comment } from './types'

export const profilePictureSize = 40
export const profilePictureMargin = 10

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }),
  profilePicture: css({
    display: 'block',
    width: pxToRem(40),
    flex: `0 0 ${pxToRem(40)}`,
    height: pxToRem(40),
    marginRight: pxToRem(8),
  }),
  indentIndicators: css({
    flexShrink: 0,
    marginRight: pxToRem(8 - 4),
    display: 'flex',
  }),
  indentIndicator: css({
    width: pxToRem(4 + config.verticalLineWidth),
    height: pxToRem(40),
    borderLeftWidth: pxToRem(config.verticalLineWidth),
    borderLeftStyle: 'solid',
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
    ...convertStyleToRem(sansSerifMedium16),
    lineHeight: pxToRem(20),
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 1,
    textDecoration: 'none',
    ...ellipsize,
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
  linkUnderline: css({
    color: 'inherit',
    textDecoration: 'none',
    '@media (hover)': {
      '[href]:hover': underline,
    },
  }),
  actionsWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    height: pxToRem('40px'),
    '& > *:not(:last-child)': {
      marginRight: 8,
    },
  }),
}

/**
 * This class name is exported so that <CommentNode> can control the visibility
 * of this action button on hover over the whole comment element.
 */
export const COLLAPSE_WRAPPER_CLASSNAME = 'comment-collapse-wrapper'

type HeaderProps = {
  t: Formatter
  comment: Pick<Comment, 'id' | 'createdAt' | 'displayAuthor'> &
    Partial<
      Pick<
        Comment,
        | 'published'
        | 'adminUnpublished'
        | 'unavailable'
        | 'comments'
        | 'parentIds'
        | 'updatedAt'
      >
    >
  menuItems?: ComponentPropsWithoutRef<typeof ActionsMenu>['items']
  isExpanded?: boolean
  onToggle?: () => void
  CommentLink?: ComponentType<CommentLinkProps>
  isPreview?: boolean
}

export const Header = ({
  t,
  comment,
  menuItems,
  isExpanded,
  onToggle,
  CommentLink = DefaultCommentLink,
  isPreview = false,
}: HeaderProps) => {
  const [colorScheme] = useColorContext()
  const { discussion } = useContext(DiscussionContext)
  const {
    displayAuthor,
    published = true,
    adminUnpublished = false,
    unavailable,
    comments,
    parentIds = [],
  } = comment
  const { profilePicture, name } = displayAuthor || {}

  return (
    <div {...styles.root}>
      {(() => {
        const n = parentIds.length - config.nestLimit
        if (n < 0) {
          if (!profilePicture || !published) {
            return null
          }
          return (
            <CommentLink displayAuthor={displayAuthor} passHref>
              <a {...styles.link}>
                <img
                  {...styles.profilePicture}
                  src={profilePicture}
                  alt={name}
                />
              </a>
            </CommentLink>
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
            <CommentLink displayAuthor={displayAuthor} passHref>
              <a {...styles.linkUnderline}>{name}</a>
            </CommentLink>
          )}
        </div>
        <HeaderMetaLine
          comment={comment}
          discussion={discussion}
          t={t}
          CommentLink={CommentLink}
          isPreview={isPreview}
        />
      </div>
      <div {...styles.actionsWrapper}>
        {onToggle && (
          <div className={COLLAPSE_WRAPPER_CLASSNAME}>
            <IconButton
              invert={true}
              Icon={isExpanded ? IconRemove : IconAdd}
              fillColorName='textSoft'
              size={20}
              onClick={onToggle}
              style={{
                marginLeft: 10,
              }}
              label={
                !isExpanded &&
                t.pluralize('styleguide/comment/header/expandCount', {
                  count: comments.totalCount + 1,
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
