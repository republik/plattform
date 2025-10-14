import { css, merge } from 'glamor'
import React, { useMemo } from 'react'
import { mUp } from '../../../theme/mediaQueries'
import { useColorContext } from '../../Colors/ColorContext'
import * as config from '../config'
import * as Comment from '../Internal/Comment'
import { ActionMenuItem } from '../Internal/Comment/ActionsMenu'
import { CommentActions } from '../Internal/Comment/CommentActions'
import { Header } from '../Internal/Comment/Header'
import { LoadMore } from './LoadMore'

const styles = {
  highlightContainer: css({
    padding: '7px 7px 0 7px',
    margin: '0 -7px 12px -7px',
  }),
  showMUp: css({
    display: 'none',
    [mUp]: {
      display: 'block',
    },
  }),
  hideMUp: css({
    [mUp]: {
      display: 'none',
    },
  }),
  modalRoot: css({
    marginBottom: 15,
  }),
  hiddenToggle: css({ display: 'none' }),
  root: ({ nestLimitExceeded, depth }) =>
    css({
      background: 'transparent',
      position: 'relative',
      margin: `48px 0 ${24 + (depth === 0 ? 20 : 0)}px`,
      paddingLeft: nestLimitExceeded || depth < 1 ? 0 : config.indentSizeS,
      borderBottomWidth: depth === 0 ? 1 : 0,
      borderBottomStyle: 'solid',
      paddingBottom: depth === 0 ? 24 : 0,
      [mUp]: {
        paddingLeft: nestLimitExceeded || depth < 1 ? 0 : config.indentSizeM,
      },
    }),
  verticalToggle: ({ depth, isLast }) =>
    css({
      position: 'absolute',
      top: -24,
      left: -((config.indentSizeS - config.verticalLineWidth) / 2),
      bottom: -(depth === 1 && !isLast ? 24 : 0),
      width: config.indentSizeS,

      [mUp]: {
        left: -((config.indentSizeM - config.verticalLineWidth) / 2),
        width: config.indentSizeM,
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
          left: (config.indentSizeM - config.verticalLineWidth) / 2,
        },
      },
    }),
  menuWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    '> *:not(:last-child)': {
      marginBottom: '1rem',
    },
  }),
}

const MockLink = (props) => <>{props.children}</>

type CommentUIProps = {
  t: any
  comment: any
  tagText?: string
  menuItems?: ActionMenuItem[]
  CommentLink?: React.ElementType
  isPreview?: boolean
  isHighlighted?: boolean
}

export const CommentUI = ({
  t,
  comment,
  menuItems,
  CommentLink = MockLink,
  isPreview = false,
  isHighlighted = false,
}: CommentUIProps) => (
  <div>
    <Header
      t={t}
      comment={comment}
      menuItems={menuItems}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      CommentLink={CommentLink}
      isPreview={isPreview}
    />
    <div style={{ marginTop: 12 }}>
      <Comment.Body
        t={t}
        comment={comment}
        context={
          comment?.tags && comment.tags.length > 0
            ? { title: comment.tags[0] }
            : undefined
        }
        isPreview={isPreview}
        isHighlighted={isHighlighted}
      />
    </div>
  </div>
)

export type CommentProps<CommentType = any> = {
  children?: React.ReactNode
  t: any
  comment: CommentType
  actions: {
    handleShare: (comment: CommentType) => Promise<unknown>
    handleReply: () => void
    handleLoadReplies: () => Promise<unknown>
    handleEdit: () => void
    handleReport: (commentId: string, message: string) => unknown
  }
  voteActions?: {
    handleUpVote: (commentId: string) => Promise<unknown>
    handleDownVote: (commentId: string) => Promise<unknown>
    handleUnVote: (commentId: string) => Promise<unknown>
  }
  menuItems?: ActionMenuItem[]
  focusId?: string
  isLast?: boolean
  CommentLink: React.ElementType
  userCanComment?: boolean
  userWaitUntil?: string
  editComposer: React.ReactNode
}

/**
 * The Comment component manages the expand/collapse state of its children.
 * It also manages
 * the editor for the comment itself, and composer for replies.
 */
const CommentNode = ({
  children,
  t,
  comment,
  actions,
  voteActions,
  menuItems = [],
  userCanComment,
  userWaitUntil,
  focusId,
  isLast,
  CommentLink,
  editComposer,
}: CommentProps) => {
  const { id, parentIds } = comment
  const isHighlighted = id === focusId
  const depth = parentIds.length
  const nestLimitExceeded = depth > config.nestLimit
  const isRoot = depth === 0

  const root = React.useRef(null)
  const [colorScheme] = useColorContext()

  const rootStyle = styles.root({
    nestLimitExceeded,
    depth,
  })
  const verticalToggleStyle =
    !isRoot && styles.verticalToggle({ depth, isLast })
  const verticalToggleStyleRules = useMemo(
    () =>
      css({
        '::before': { background: colorScheme.getCSSColor('divider') },
        '@media (hover)': {
          ':hover::before': {
            background: colorScheme.getCSSColor('primary'),
          },
        },
      }),
    [colorScheme],
  )

  return (
    <div
      ref={root}
      data-comment-id={id}
      {...rootStyle}
      {...colorScheme.set('borderColor', 'divider')}
    >
      {!nestLimitExceeded && verticalToggleStyle && (
        <div {...verticalToggleStyle} {...verticalToggleStyleRules} />
      )}
      <div
        {...merge(
          isHighlighted && styles.highlightContainer,
          isHighlighted && colorScheme.set('backgroundColor', 'alert'),
        )}
      >
        {editComposer ? (
          editComposer
        ) : (
          <CommentUI
            t={t}
            comment={comment}
            isHighlighted={isHighlighted}
            menuItems={menuItems}
            CommentLink={CommentLink}
          />
        )}

        {comment?.text && (
          <CommentActions
            t={t}
            comment={comment}
            actions={actions}
            voteActions={voteActions}
            userCanComment={userCanComment}
            userWaitUntil={userWaitUntil}
          />
        )}
      </div>
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
}

export default CommentNode
