import React from 'react'
import { css } from 'glamor'
import { renderMdast } from 'mdast-react-render'

import { DiscussionContext } from '../../DiscussionContext'

import { Label } from '../../../Typography'
import { sansSerifRegular14 } from '../../../Typography/styles'

import colors from '../../../../theme/colors'
import { mUp } from '../../../../theme/mediaQueries'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { useBoundingClientRect } from '../../../../lib/useBoundingClientRect'

import createCommentSchema from '../../../../templates/Comment'

import { Context } from './Context'

import { COLLAPSED_HEIGHT } from '../../config'

const schema = createCommentSchema()
const highlightPadding = 7

const buttonStyle = {
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  padding: '0',
  display: 'block',
  cursor: 'pointer',
  height: '100%'
}

const styles = {
  container: css({
    position: 'relative'
  }),
  highlight: css({
    top: -highlightPadding,
    left: -highlightPadding,
    right: -highlightPadding,
    bottom: -highlightPadding,
    padding: highlightPadding,
    width: `calc(100% + ${highlightPadding * 2}px)`,
    backgroundColor: colors.primaryBg
  }),
  margin: css({
    display: 'block',
    marginTop: 8
  }),
  unpublished: css({
    marginBottom: 8
  }),
  collapsedBody: css({
    height: `${COLLAPSED_HEIGHT.mobile}px`,
    overflow: 'hidden',
    [mUp]: {
      maxHeight: `${COLLAPSED_HEIGHT.desktop}px`
    }
  }),
  context: css({
    marginBottom: 10
  }),
  collapeToggleContainer: css({
    position: 'relative',
    borderTop: `1px solid ${colors.divider}`,
    '&::before': {
      position: 'absolute',
      display: 'block',
      content: '""',
      left: 0,
      right: 0,
      top: -61,
      height: 60,
      background: 'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
    }
  }),
  collapseToggleButton: css({
    ...buttonStyle,
    ...sansSerifRegular14,
    color: colors.primary,
    height: '32px',
    lineHeight: '32px',
    '&:hover': {
      color: colors.secondary
    }
  })
}

const MissingNode = ({ node, children }) => {
  return (
    <span
      style={{
        textDecoration: `underline wavy ${colors.divider}`,
        display: 'inline-block',
        margin: 4
      }}
      title={`Markdown element "${node.type}" wird nicht unterstützt.`}
    >
      {children || node.value || node.identifier || '[…]'}
    </span>
  )
}

export const Body = ({ t, comment, context }) => {
  const { discussion, highlightedCommentId } = React.useContext(DiscussionContext)
  const { collapsable } = discussion

  const { published, content, userCanEdit, adminUnpublished } = comment

  /**
   * Measuring the comment body size (height), so we can deterimine whether to collapse
   * the comment body.
   *
   * bodyVisibility:
   *   - 'indeterminate': We don't know yet whether to collapse the body or not.
   *   - 'full': The body is collapsable but we're showing the full body.
   *   - 'preview': The body is collapsed.
   */
  const [bodyVisibility, setBodyVisibility] = React.useState('indeterminate')
  const [bodyRef, bodySize] = useBoundingClientRect([content])
  const isDesktop = useMediaQuery(mUp)
  React.useEffect(() => {
    /*
     * Don't collapse the body if this is the highlighted comment.
     */
    if (highlightedCommentId === comment.id) {
      return
    }

    /*
     * Collapse the body (switch to 'preview' visibility) when allowed and the size
     * exceeds the threshold.
     */
    if (bodyVisibility === 'indeterminate' && collapsable && bodySize.height !== undefined) {
      const maxBodyHeight = isDesktop ? COLLAPSED_HEIGHT.desktop : COLLAPSED_HEIGHT.mobile
      if (bodySize.height > maxBodyHeight + COLLAPSED_HEIGHT.threshold) {
        setBodyVisibility('preview')
      }
    }
  }, [comment.id, highlightedCommentId, isDesktop, collapsable, bodyVisibility, bodySize])

  const collapsed = !collapsable || bodyVisibility === 'indeterminate' ? undefined : bodyVisibility === 'preview'
  const collapseLabel = t(`styleguide/CommentActions/${collapsed ? 'expand' : 'collapse'}`)
  const onToggleCollapsed = React.useCallback(() => setBodyVisibility(v => (v === 'preview' ? 'full' : 'preview')), [
    setBodyVisibility
  ])

  return (
    <>
      {!published && <div {...styles.unpublished}>{t('styleguide/comment/unpublished')}</div>}

      <div ref={bodyRef} {...(collapsed ? styles.collapsedBody : undefined)} style={{ opacity: published ? 1 : 0.5 }}>
        {content && context && context.title && (
          <div {...styles.context}>
            <Context {...context} />
          </div>
        )}
        {content && renderMdast(content, schema, { MissingNode })}
      </div>

      {userCanEdit &&
        (() => {
          if (adminUnpublished) {
            return <Label {...styles.margin}>{t('styleguide/comment/adminUnpublished')}</Label>
          } else if (!published) {
            return <Label {...styles.margin}>{t('styleguide/comment/unpublished/userCanEdit')}</Label>
          } else {
            return null
          }
        })()}

      {bodyVisibility !== 'indeterminate' && (
        <div {...(collapsed ? styles.collapeToggleContainer : {})}>
          <button {...styles.collapseToggleButton} onClick={onToggleCollapsed} title={collapseLabel}>
            {collapseLabel}
          </button>
        </div>
      )}
    </>
  )
}
