import React, { FC, useMemo } from 'react'
import * as config from '../config'
import { useColorContext } from '../../Colors/ColorContext'
import { css, merge } from 'glamor'
import * as Comment from '../Internal/Comment'
import { CommentActions } from '../Internal/Comment/CommentActions'
import { mUp } from '../../../theme/mediaQueries'
import { collapseWrapperRule } from '../Internal/Comment'
import PropTypes, { InferProps } from 'prop-types'
import { ActionsMenuItemPropType } from '../Internal/Comment/ActionsMenu'
import { Header } from '../Internal/Comment/Header'
import { LoadMore } from './LoadMore'

const buttonStyle = {
  display: 'block',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  padding: 0
}

const styles = {
  highlightContainer: css({
    padding: '7px 7px 0 7px',
    margin: '0 -7px 12px -7px'
  }),
  boardColumn: css({
    [mUp]: {
      flex: '1 0 auto',
      padding: 10,
      width: '50%'
    }
  }),
  showMUp: css({
    display: 'none',
    [mUp]: {
      display: 'block'
    }
  }),
  hideMUp: css({
    [mUp]: {
      display: 'none'
    }
  }),
  modalRoot: css({
    marginBottom: 15
  }),
  hiddenToggle: css({ display: 'none' }),
  commentWrapper: ({ isExpanded }) =>
    css({
      /*
       * On larger screens, hide the action button and reveal only on hover.
       */
      [mUp]: isExpanded && {
        [`& .${collapseWrapperRule}`]: {
          visibility: 'hidden'
        },
        '@media(hover)': {
          [`:hover .${collapseWrapperRule}`]: {
            visibility: 'visible'
          }
        }
      },
      // In case device doesn't support hover
      '@media(hover:none)': {
        [`& .${collapseWrapperRule}`]: {
          visibility: 'visible'
        }
      }
    }),
  root: ({ isExpanded, nestLimitExceeded, depth, board }) =>
    css({
      background: 'transparent',
      position: 'relative',
      margin: `10px 0 ${(isExpanded ? 24 : 16) + (depth === 0 ? 20 : 0)}px`,
      paddingLeft: nestLimitExceeded || depth < 1 ? 0 : config.indentSizeS,
      [mUp]: {
        paddingLeft: nestLimitExceeded || depth < 1 ? 0 : config.indentSizeM,
        ...(board
          ? {
              display: 'flex',
              marginLeft: -10,
              marginRight: -10,
              marginBottom: 50
            }
          : {})
      }
    }),
  verticalToggle: ({ drawLineEnd, depth, isExpanded, isLast }) =>
    css({
      ...buttonStyle,
      position: 'absolute',
      top: 0,
      left: -((config.indentSizeS - config.verticalLineWidth) / 2),
      bottom:
        (drawLineEnd ? 20 : 0) -
        (depth === 1 && !isLast ? (isExpanded ? 24 : 16) : 0),
      width: config.indentSizeS,

      [mUp]: {
        left: -((config.indentSizeM - config.verticalLineWidth) / 2),
        width: config.indentSizeM
      },
      '::before': {
        display: 'block',
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: (config.indentSizeS - config.verticalLineWidth) / 2,
        width: config.verticalLineWidth,
        [mUp]: {
          left: (config.indentSizeM - config.verticalLineWidth) / 2
        }
      },
      ...(drawLineEnd
        ? {
            '::after': {
              display: 'block',
              content: '""',
              position: 'absolute',
              width: `${config.verticalLineWidth + 2 * 2}px`,
              height: `${config.verticalLineWidth + 2 * 2}px`,
              bottom: -2 - config.verticalLineWidth / 2,
              borderRadius: '100%',
              left: (config.indentSizeS - config.verticalLineWidth) / 2 - 2,
              [mUp]: {
                left: (config.indentSizeM - config.verticalLineWidth) / 2 - 2
              }
            }
          }
        : {})
    }),
  menuWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    '> *:not(:last-child)': {
      marginBottom: '1rem'
    }
  })
}

const propTypes = {
  t: PropTypes.func.isRequired,
  comment: PropTypes.object.isRequired,
  actions: PropTypes.shape({
    handleUpVote: PropTypes.func.isRequired,
    handleDownVote: PropTypes.func.isRequired,
    handleUnVote: PropTypes.func.isRequired,
    handleShare: PropTypes.func,
    handleReply: PropTypes.func,
    handleLoadReplies: PropTypes.func
  }),
  menuItems: PropTypes.arrayOf(ActionsMenuItemPropType),
  focusId: PropTypes.number,
  isLast: PropTypes.bool,
  board: PropTypes.bool,
  rootCommentOverlay: PropTypes.bool,
  Link: PropTypes.elementType.isRequired,
  focusHref: PropTypes.string.isRequired,
  profileHref: PropTypes.string.isRequired,
  userCanComment: PropTypes.bool,
  userWaitUntil: PropTypes.string,

  editComposer: PropTypes.node
}

/**
 * The Comment component manages the expand/collapse state of its children.
 * It also manages
 * the editor for the comment itself, and composer for replies.
 */
const CommentNode: FC<InferProps<typeof propTypes>> = ({
  children,
  t,
  comment,
  actions,
  menuItems = [],
  userCanComment,
  userWaitUntil,
  focusId,
  isLast,
  board,
  rootCommentOverlay,
  Link,
  focusHref,
  profileHref,

  editComposer
}) => {
  const { id, parentIds, tags, text } = comment as any
  const isHighlighted = id === focusId
  const depth = parentIds.length
  const nestLimitExceeded = depth > config.nestLimit
  const isRoot = depth === 0

  const activeTag = false

  const root = React.useRef()
  const [isExpanded, setExpanded] = React.useState(true)
  const [colorScheme] = useColorContext()

  /*
   * This is an experiment to draw end points at the vertical toggle lines.
   */
  const drawLineEnd = false

  const rootStyle = styles.root({ isExpanded, nestLimitExceeded, depth, board })
  const verticalToggleStyle =
    !isRoot && styles.verticalToggle({ isExpanded, depth, drawLineEnd, isLast })
  const verticalToggleStyleRules = useMemo(
    () =>
      css({
        '::before': { background: colorScheme.getCSSColor('divider') },
        '@media (hover)': {
          ':hover::before': {
            background: colorScheme.getCSSColor('primary')
          },
          ':hover::after': {
            background: drawLineEnd
              ? colorScheme.getCSSColor('primary')
              : 'none'
          }
        },
        '::after': {
          background: drawLineEnd ? colorScheme.getCSSColor('divider') : 'none'
        }
      }),
    [colorScheme, drawLineEnd]
  )

  if (isExpanded) {
    return (
      <div ref={root} data-comment-id={id} {...rootStyle}>
        {!nestLimitExceeded && !board && verticalToggleStyle && (
          <button
            {...verticalToggleStyle}
            {...verticalToggleStyleRules}
            onClick={() => setExpanded(prev => !prev)}
          />
        )}
        <div
          {...merge(
            isHighlighted && styles.highlightContainer,
            isHighlighted && colorScheme.set('backgroundColor', 'alert'),

            board ? styles.boardColumn : null,
            isRoot && rootCommentOverlay ? styles.modalRoot : null
          )}
        >
          {editComposer ? (
            editComposer
          ) : (
            <div {...styles.commentWrapper({ isExpanded })}>
              <Header
                t={t}
                comment={comment}
                isExpanded={isExpanded}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                onToggle={
                  !board && !(isRoot && rootCommentOverlay)
                    ? () => setExpanded(prev => !prev)
                    : undefined
                }
                menuItems={menuItems}
                Link={Link}
                focusHref={focusHref}
                profileHref={profileHref}
              />
              <div style={{ marginTop: 12 }}>
                <Comment.Body
                  t={t}
                  comment={comment}
                  context={
                    !activeTag && tags[0] ? { title: tags[0] } : undefined
                  }
                />
                {(board || (rootCommentOverlay && isRoot)) && (
                  <div
                    {...styles.hideMUp}
                    style={{ marginTop: rootCommentOverlay ? 15 : null }}
                  >
                    <Comment.Embed comment={comment} />
                  </div>
                )}
              </div>
            </div>
          )}

          <CommentActions
            t={t}
            comment={comment}
            actions={{
              handleReply: actions.handleReply,
              handleShare: actions.handleShare,
              handleLoadReplies: actions.handleLoadReplies
            }}
            voteActions={{
              handleUpVote: actions.handleUpVote,
              handleDownVote: actions.handleDownVote,
              handleUnVote: actions.handleUnVote
            }}
            userCanComment={userCanComment}
            userWaitUntil={userWaitUntil}
          />
        </div>

        {board && (
          <div {...styles.boardColumn} {...styles.showMUp}>
            <Comment.Embed comment={comment} />
          </div>
        )}
        {children}
        <LoadMore
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          t={t}
          visualDepth={0}
          count={
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            comment?.comments?.directTotalCount - comment.comments.nodes.length
          }
          onClick={actions.handleLoadReplies}
        />
      </div>
    )
  } else {
    return (
      <div ref={root} data-comment-id={id} {...rootStyle}>
        {verticalToggleStyle && (
          <button
            {...verticalToggleStyle}
            onClick={() => setExpanded(prev => !prev)}
          />
        )}
        <Comment.Header
          t={t}
          comment={comment}
          isExpanded={isExpanded}
          onToggle={() => setExpanded(prev => !prev)}
          menuItems={menuItems}
          Link={Link}
          focusHref={focusHref}
          profileHref={profileHref}
        />
      </div>
    )
  }
}

CommentNode.propTypes = propTypes

export default CommentNode
