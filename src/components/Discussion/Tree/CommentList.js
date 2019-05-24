import React, { Fragment } from 'react'
import { css } from 'glamor'
import { DiscussionContext } from '../DiscussionContext'
import { CommentComposer } from '../Composer/CommentComposer'

import { LoadMore } from './LoadMore'
import * as Comment from '../Internal/Comment'
import colors from '../../../theme/colors'

import * as config from '../config'

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
  root: ({ isExpanded, nestLimitExceeded }) =>
    css({
      position: 'relative',
      margin: `10px 0 ${isExpanded ? 24 : 16}px`,
      paddingLeft: nestLimitExceeded ? 0 : config.indentSize
    }),
  verticalToggle: css({
    ...buttonStyle,
    position: 'absolute',
    top: 0,
    left: -((config.indentSize - config.verticalLineWidth) / 2),
    bottom: 0,
    width: config.indentSize,

    '&::before': {
      display: 'block',
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: (config.indentSize - config.verticalLineWidth) / 2,
      width: config.verticalLineWidth,
      background: colors.divider
    },

    '&:hover::before': {
      background: colors.primary
    }
  })
}

export const CommentList = ({ t, parentId = null, comments }) => {
  const { actions } = React.useContext(DiscussionContext)

  if (!comments) {
    return null
  }

  const { nodes = [] } = comments

  const numMoreComments = (() => {
    const countComments = comments => {
      if (comments && comments.totalCount) {
        return comments.totalCount || 0
      } else {
        return 0
      }
    }

    const availableCount = nodes.reduce((a, { comments }) => a + 1 + countComments(comments), 0)
    return comments.totalCount - availableCount
  })()

  return (
    <Fragment>
      {nodes.map(comment => (
        <CommentNode key={comment.id} t={t} comment={comment} />
      ))}

      {numMoreComments > 0 && (
        <LoadMore
          t={t}
          visualDepth={0}
          count={numMoreComments}
          onClick={() => {
            actions.fetchMoreComments(parentId, comments.pageInfo.endCursor)
          }}
        />
      )}
    </Fragment>
  )
}

/**
 * The Comment component manages the expand/collapse state of its children. It also manages
 * the editor for the comment itself, and composer for replies.
 */
const CommentNode = ({ t, comment }) => {
  const { discussion, highlightedCommentId, actions } = React.useContext(DiscussionContext)
  const { displayAuthor } = discussion

  const { id, parentIds, text, comments } = comment

  const isHighlighted = id === highlightedCommentId
  const nestLimitExceeded = parentIds.length > config.nestLimit

  /**
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
  const [{ mode, isExpanded, showReplyComposer }, dispatch] = React.useReducer(
    (state, action) => {
      if ('editComment' in action) {
        return { ...state, mode: 'edit' }
      } else if ('closeEditor' in action) {
        return { ...state, mode: 'view' }
      } else if ('showReplyComposer' in action) {
        return { ...state, showReplyComposer: true }
      } else if ('closeReplyComposer' in action) {
        return { ...state, showReplyComposer: false }
      } else if ('toggleReplies' in action) {
        return { ...state, isExpanded: !state.isExpanded }
      } else {
        return state
      }
    },
    { mode: 'view', bodyVisibility: 'indeterminate', isExpanded: true, showReplyComposer: false }
  )

  const toggleReplies = React.useCallback(() => {
    dispatch({ toggleReplies: {} })
  }, [dispatch])

  const rootStyle = styles.root({ isExpanded, nestLimitExceeded })

  if (isExpanded) {
    return (
      <div data-comment-id={id} {...rootStyle}>
        {!nestLimitExceeded && <button {...styles.verticalToggle} onClick={toggleReplies} />}
        <div {...(mode === 'view' && isHighlighted ? styles.highlightContainer : {})}>
          {{
            view: () => (
              <Fragment>
                <Comment.Header t={t} comment={comment} isExpanded={isExpanded} onToggle={toggleReplies} />
                <div style={{ marginTop: 12 }}>
                  <Comment.Body t={t} comment={comment} />
                </div>
              </Fragment>
            ),
            edit: () => (
              <CommentComposer
                t={t}
                initialText={text}
                displayAuthor={displayAuthor}
                onClose={() => dispatch({ closeEditor: {} })}
                onSubmit={({ text, tags }) => {
                  return new Promise((resolve, reject) => {
                    actions.editComment(comment, text, tags).then(
                      () => {
                        resolve()
                        dispatch({ closeEditor: {} })
                      },
                      e => {
                        reject('' + e)
                      }
                    )
                  })
                }}
                onSubmitLabel={t('styleguide/comment/edit/submit')}
              />
            )
          }[mode]()}

          <Comment.Actions
            t={t}
            comment={comment}
            onReply={() => {
              dispatch({ showReplyComposer: {} })
            }}
            onEdit={() => {
              dispatch({ editComment: {} })
            }}
          />
        </div>

        {showReplyComposer && (
          <div style={{ marginBottom: 30 }}>
            <CommentComposer
              t={t}
              displayAuthor={displayAuthor}
              onClose={() => {
                dispatch({ closeReplyComposer: {} })
              }}
              onSubmit={({ text, tags }) => {
                return new Promise((resolve, reject) => {
                  actions.submitComment(comment, text, tags).then(
                    () => {
                      resolve()
                      dispatch({ closeReplyComposer: {} })
                    },
                    e => {
                      reject('' + e)
                    }
                  )
                })
              }}
            />
          </div>
        )}

        {(() => {
          if (comments && comments.totalCount > 0) {
            return <CommentList t={t} parentId={id} comments={comments} />
          } else {
            return null
          }
        })()}
      </div>
    )
  } else {
    return (
      <div data-comment-id={id} {...rootStyle}>
        <button {...styles.verticalToggle} onClick={toggleReplies} />
        <Comment.Header t={t} comment={comment} isExpanded={isExpanded} onToggle={toggleReplies} />
      </div>
    )
  }
}
