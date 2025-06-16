import React, { useMemo } from 'react'
import * as config from '../config'
import { useColorContext } from '../../Colors/ColorContext'
import { css, merge } from 'glamor'
import * as Comment from '../Internal/Comment'
import { CommentActions } from '../Internal/Comment/CommentActions'
import { mUp } from '../../../theme/mediaQueries'
import { COLLAPSE_WRAPPER_CLASSNAME } from '../Internal/Comment'
import { Header } from '../Internal/Comment/Header'
import { LoadMore } from './LoadMore'
import { ActionMenuItem } from '../Internal/Comment/ActionsMenu'

const buttonStyle = {
  display: 'block',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  padding: 0,
}

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
  commentWrapper: ({ isExpanded }) =>
    css({
      /*
       * On larger screens, hide the action button and reveal only on hover.
       */
      [mUp]: isExpanded && {
        [`& .${COLLAPSE_WRAPPER_CLASSNAME}`]: {
          visibility: 'hidden',
        },
        '@media(hover)': {
          [`:hover .${COLLAPSE_WRAPPER_CLASSNAME}`]: {
            visibility: 'visible',
          },
        },
      },
      // In case device doesn't support hover
      '@media(hover:none)': {
        [`& .${COLLAPSE_WRAPPER_CLASSNAME}`]: {
          visibility: 'visible',
        },
      },
    }),
  root: ({ isExpanded, nestLimitExceeded, depth }) =>
    css({
      background: 'transparent',
      position: 'relative',
      margin: `10px 0 ${(isExpanded ? 24 : 16) + (depth === 0 ? 20 : 0)}px`,
      paddingLeft: nestLimitExceeded || depth < 1 ? 0 : config.indentSizeS,
      [mUp]: {
        paddingLeft: nestLimitExceeded || depth < 1 ? 0 : config.indentSizeM,
      },
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
                left: (config.indentSizeM - config.verticalLineWidth) / 2 - 2,
              },
            },
          }
        : {}),
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
  isExpanded: boolean
  onToggle?: () => void
  tagText?: string
  menuItems?: ActionMenuItem[]
  CommentLink?: React.ElementType
  isPreview?: boolean
  isHighlighted?: boolean
}

export const CommentUI = ({
  t,
  comment,
  isExpanded,
  onToggle,
  menuItems,
  CommentLink = MockLink,
  isPreview = false,
  isHighlighted = false,
}: CommentUIProps) => (
  <div {...styles.commentWrapper({ isExpanded })}>
    <Header
      t={t}
      comment={comment}
      isExpanded={isExpanded}
      onToggle={onToggle}
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

  const root = React.useRef()
  const [isExpanded, setExpanded] = React.useState(true)
  const [colorScheme] = useColorContext()

  /*
   * This is an experiment to draw end points at the vertical toggle lines.
   */
  const drawLineEnd = false

  const rootStyle = styles.root({
    isExpanded,
    nestLimitExceeded,
    depth,
  })
  const verticalToggleStyle =
    !isRoot && styles.verticalToggle({ isExpanded, depth, drawLineEnd, isLast })
  const verticalToggleStyleRules = useMemo(
    () =>
      css({
        '::before': { background: colorScheme.getCSSColor('divider') },
        '@media (hover)': {
          ':hover::before': {
            background: colorScheme.getCSSColor('primary'),
          },
          ':hover::after': {
            background: drawLineEnd
              ? colorScheme.getCSSColor('primary')
              : 'none',
          },
        },
        '::after': {
          background: drawLineEnd ? colorScheme.getCSSColor('divider') : 'none',
        },
      }),
    [colorScheme, drawLineEnd],
  )

  if (isExpanded) {
    return (
      <div ref={root} data-comment-id={id} {...rootStyle}>
        {!nestLimitExceeded && verticalToggleStyle && (
          <button
            {...verticalToggleStyle}
            {...verticalToggleStyleRules}
            onClick={() => setExpanded((prev) => !prev)}
          />
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
              isExpanded={isExpanded}
              isHighlighted={isHighlighted}
              onToggle={() => {
                setExpanded((prev) => !prev)
              }}
              menuItems={menuItems}
              CommentLink={CommentLink}
            />
          )}

          <CommentActions
            t={t}
            comment={comment}
            actions={actions}
            voteActions={voteActions}
            userCanComment={userCanComment}
            userWaitUntil={userWaitUntil}
          />
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
  } else {
    return (
      <div ref={root} data-comment-id={id} {...rootStyle}>
        {verticalToggleStyle && (
          <button
            {...verticalToggleStyle}
            onClick={() => setExpanded((prev) => !prev)}
          />
        )}
        <Comment.Header
          t={t}
          comment={comment}
          isExpanded={isExpanded}
          onToggle={() => setExpanded((prev) => !prev)}
          menuItems={menuItems}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          CommentLink={CommentLink}
        />
      </div>
    )
  }
}

export default CommentNode
