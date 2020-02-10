import React from 'react'
import { css, merge } from 'glamor'
import scrollIntoView from 'scroll-into-view'

import colors from '../../../theme/colors'
import { DiscussionContext } from '../DiscussionContext'
import { CommentComposer } from '../Composer/CommentComposer'
import { LoadMore } from './LoadMore'
import * as Comment from '../Internal/Comment'
import * as config from '../config'
import { mUp } from '../../../theme/mediaQueries'

const buttonStyle = {
  display: 'block',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  padding: 0
}

const styles = {
  highlightContainer: css({
    padding: '7px 7px 0 7px',
    margin: '0 -7px 12px -7px',
    background: colors.primaryBg
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
        '@media (hover)': {
          [`& [data-${Comment.headerActionStyle({ isExpanded })}]`]: {
            display: 'none'
          },
          [`&:hover [data-${Comment.headerActionStyle({ isExpanded })}]`]: {
            display: 'block'
          }
        }
      }
    }),
  root: ({ isExpanded, nestLimitExceeded, depth, board }) =>
    css({
      position: 'relative',
      margin: `10px 0 ${(isExpanded ? 24 : 16) + (depth === 0 ? 20 : 0)}px`,
      paddingLeft: nestLimitExceeded || depth < 1 ? 0 : config.indentSizeS,
      background: 'white',

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
        background: colors.divider,

        [mUp]: {
          left: (config.indentSizeM - config.verticalLineWidth) / 2
        }
      },
      '@media (hover)': {
        ':hover::before': {
          background: colors.primary
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
              background: colors.divider,

              [mUp]: {
                left: (config.indentSizeM - config.verticalLineWidth) / 2 - 2
              }
            },
            '@media (hover)': {
              ':hover::after': {
                background: colors.primary
              }
            }
          }
        : {})
    })
}

export const CommentList = ({
  t,
  parentId = null,
  comments,
  board = false,
  rootCommentOverlay = false
}) => {
  const { actions, discussion } = React.useContext(DiscussionContext)

  const { nodes = [], totalCount = 0, pageInfo } = comments
  const { endCursor } = pageInfo || {}
  const lastNode = nodes[nodes.length - 1]

  const loadMore = React.useCallback(() => {
    const appendAfter = lastNode ? lastNode.id : undefined
    actions.fetchMoreComments({ parentId, after: endCursor, appendAfter })
  }, [parentId, endCursor, lastNode, actions])

  const numMoreComments = (() => {
    const countComments = ({ totalCount = 0 } = {}) => totalCount
    const availableCount = nodes.reduce(
      (a, { comments }) => a + 1 + countComments(comments),
      0
    )
    return totalCount - availableCount
  })()

  return (
    <>
      {nodes.map((comment, i) => (
        <CommentNode
          key={comment.id}
          t={t}
          comment={comment}
          board={board}
          rootCommentOverlay={rootCommentOverlay}
          discussion={discussion}
          isLast={i === nodes.length - 1}
        />
      ))}
      <LoadMore
        t={t}
        visualDepth={0}
        count={numMoreComments}
        onClick={loadMore}
      />
    </>
  )
}

/**
 * The Comment component manages the expand/collapse state of its children. It also manages
 * the editor for the comment itself, and composer for replies.
 */
const CommentNode = ({
  t,
  discussion,
  comment,
  board,
  rootCommentOverlay,
  isLast
}) => {
  const { highlightedCommentId, actions } = React.useContext(DiscussionContext)
  const { id, parentIds, tags, text, comments } = comment
  const { displayAuthor } = discussion
  const isHighlighted = id === highlightedCommentId
  const depth = parentIds.length
  const nestLimitExceeded = depth > config.nestLimit
  const isRoot = depth === 0

  const root = React.useRef()

  /*
   * The local state that the CommentNode component manages.
   *
   * {
   *   mode: 'view' | 'edit'
   *   isExpanded: boolean
   *   showReplyComposer: boolean
   * }
   *
   * Actions
   *
   *  - editComment / closeEditor
   *  - showReplyComposer / closeReplyComposer
   *  - toggleReplies
   */

  const [
    { mode, isExpanded, showReplyComposer, replyComposerAutoFocus },
    dispatch
  ] = React.useReducer(
    (state, action) => {
      if ('editComment' in action) {
        return { ...state, mode: 'edit' }
      } else if ('closeEditor' in action) {
        return { ...state, mode: 'view' }
      } else if ('showReplyComposer' in action) {
        return {
          ...state,
          showReplyComposer: true,
          replyComposerAutoFocus: true
        }
      } else if ('closeReplyComposer' in action) {
        return { ...state, showReplyComposer: false }
      } else if ('toggleReplies' in action) {
        return { ...state, isExpanded: !state.isExpanded }
      } else {
        return state
      }
    },
    {
      mode: 'view',
      isExpanded: true,
      replyComposerAutoFocus: false,
      showReplyComposer:
        !!displayAuthor &&
        isRoot &&
        !!rootCommentOverlay &&
        !(comments && comments.nodes && comments.nodes.length)
    }
  )

  /*
   * Functions which dispatch specific actions. For your convenience.
   */
  const closeEditor = React.useCallback(() => {
    dispatch({ closeEditor: {} })
  }, [dispatch])
  const closeReplyComposer = React.useCallback(() => {
    dispatch({ closeReplyComposer: {} })
  }, [dispatch])

  const toggleReplies = React.useCallback(() => {
    dispatch({ toggleReplies: {} })

    /*
     * When collapsing the node, and the top of the node is outside of the viewport
     * (eg. the user is collapsing a really long thread), scroll up to make sure
     * the node is in the viewport.
     *
     * FIXME: 60 is the header height (plus some), but that height is different
     * on mobile and desktop.
     */
    const topOffset = 60
    if (isExpanded && root.current.getBoundingClientRect().top < topOffset) {
      scrollIntoView(root.current, { align: { top: 0, topOffset } })
    }
  }, [dispatch, isExpanded])

  /*
   * This is an experiment to draw end points at the vertical toggle lines.
   */
  const drawLineEnd = false

  const rootStyle = styles.root({ isExpanded, nestLimitExceeded, depth, board })
  const verticalToggleStyle =
    !isRoot && styles.verticalToggle({ isExpanded, depth, drawLineEnd, isLast })

  if (isExpanded) {
    return (
      <div ref={root} data-comment-id={id} {...rootStyle}>
        {!nestLimitExceeded && !board && verticalToggleStyle && (
          <button {...verticalToggleStyle} onClick={toggleReplies} />
        )}
        <div
          {...merge(
            mode === 'view' && isHighlighted ? styles.highlightContainer : {},
            board ? styles.boardColumn : null,
            isRoot && rootCommentOverlay ? styles.modalRoot : null
          )}
        >
          {{
            view: () => (
              <div {...styles.commentWrapper({ isExpanded })}>
                <Comment.Header
                  t={t}
                  comment={comment}
                  isExpanded={isExpanded}
                  onToggle={
                    !board && !(isRoot && rootCommentOverlay) && toggleReplies
                  }
                />
                <div style={{ marginTop: 12 }}>
                  <Comment.Body
                    t={t}
                    comment={comment}
                    context={tags[0] ? { title: tags[0] } : undefined}
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
            ),
            edit: () => (
              <CommentComposer
                t={t}
                isRoot={isRoot}
                commentId={comment.id}
                initialText={text}
                tagValue={tags[0]}
                onClose={closeEditor}
                onSubmit={({ text, tags }) =>
                  actions.editComment(comment, text, tags).then(result => {
                    if (result.ok) {
                      closeEditor()
                    }

                    return result
                  })
                }
                onSubmitLabel={t('styleguide/comment/edit/submit')}
              />
            )
          }[mode]()}

          <Comment.Actions
            t={t}
            comment={comment}
            onExpand={
              board &&
              (() => {
                actions.fetchMoreComments({ parentId: id, after: {} })
              })
            }
            onReply={
              !board &&
              (() => {
                dispatch({ showReplyComposer: {} })
              })
            }
            onEdit={() => {
              dispatch({ editComment: {} })
            }}
            onReport={() => {
              actions.reportComment(comment)
            }}
          />
        </div>

        {board && (
          <div {...styles.boardColumn} {...styles.showMUp}>
            <Comment.Embed comment={comment} />
          </div>
        )}

        {showReplyComposer && (
          <div style={{ marginBottom: 30 }}>
            <CommentComposer
              t={t}
              isRoot={false /* Replies can never be root comments */}
              parentId={comment.id}
              onClose={closeReplyComposer}
              autoFocus={replyComposerAutoFocus}
              onSubmit={({ text, tags }) =>
                actions.submitComment(comment, text, tags).then(result => {
                  if (result.ok) {
                    closeReplyComposer()
                  }

                  return result
                })
              }
            />
          </div>
        )}

        {!board && (
          <CommentList
            t={t}
            parentId={id}
            comments={comments}
            rootCommentOverlay={rootCommentOverlay}
          />
        )}
      </div>
    )
  } else {
    return (
      <div ref={root} data-comment-id={id} {...rootStyle}>
        {verticalToggleStyle && (
          <button {...verticalToggleStyle} onClick={toggleReplies} />
        )}
        <Comment.Header
          t={t}
          comment={comment}
          isExpanded={isExpanded}
          onToggle={toggleReplies}
        />
      </div>
    )
  }
}
