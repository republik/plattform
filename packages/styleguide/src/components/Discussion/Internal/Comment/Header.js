import { css } from 'glamor'
import PropTypes from 'prop-types'
import React, { useContext } from 'react'
import { ellipsize, underline } from '../../../../lib/styleMixins'
import { useColorContext } from '../../../Colors/ColorContext'
import { sansSerifMedium16 } from '../../../Typography/styles'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import * as config from '../../config'
import { DiscussionContext } from '../../DiscussionContext'

import ActionsMenu, { ActionsMenuItemPropType } from './ActionsMenu'
import HeaderMetaLine from './HeaderMetaLine'

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
    marginRight: pxToRem(8),
    flexShrink: 0,
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

const propTypes = {
  t: PropTypes.func.isRequired,
  comment: PropTypes.shape({
    displayAuthor: PropTypes.shape({
      profilePicture: PropTypes.string,
      name: PropTypes.string,
    }),
    published: PropTypes.bool,
    adminUnpublished: PropTypes.bool,
    unavailable: PropTypes.bool,
    comments: PropTypes.shape({
      totalCount: PropTypes.number,
    }),
    parentIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  menuItems: PropTypes.arrayOf(ActionsMenuItemPropType),
  CommentLink: PropTypes.elementType,
  isPreview: PropTypes.bool,
}

const DefaultLink = ({ children }) => <>{children}</>

export const Header = ({
  t,
  comment,
  menuItems,
  CommentLink = DefaultLink,
  isPreview = false,
}) => {
  const [colorScheme] = useColorContext()
  const { discussion } = useContext(DiscussionContext)
  const {
    displayAuthor,
    published = true,
    adminUnpublished = false,
    unavailable,
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
        {menuItems && menuItems.length > 0 && <ActionsMenu items={menuItems} />}
      </div>
    </div>
  )
}

Header.propTypes = propTypes
