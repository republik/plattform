import React, { Component } from 'react'
import { css } from 'glamor'
import { renderMdast } from 'mdast-react-render'

import { Label } from '../Typography'

import colors from '../../theme/colors'
import { mBreakPoint, mUp } from '../../theme/mediaQueries'

import createCommentSchema from '../../templates/Comment'

import CommentContext from './CommentContext'
import CommentHeader, { profilePictureSize, profilePictureMargin } from './CommentHeader'

const schema = createCommentSchema()
const highlightPadding = 7

const COLLAPSED_HEIGHT = {
  mobile: 180,
  desktop: 240,
  // We won't collapse a comment if it just slightly exceeds the heights above.
  threshold: 50
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
    marginLeft: profilePictureSize + profilePictureMargin,
    marginBottom: 12,
    marginTop: 12
  }),
  body: css({
    margin: `12px 0 0 ${profilePictureSize + profilePictureMargin}px`
  }),
  bodyCollapsed: css({
    height: `${COLLAPSED_HEIGHT.mobile}px`,
    overflow: 'hidden',
    [mUp]: {
      maxHeight: `${COLLAPSED_HEIGHT.desktop}px`
    }
  }),
  context: css({
    marginBottom: 10
  })
}

export const MissingNode = ({node, children}) => {
  return (
    <span style={{
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

class Comment extends Component {

  constructor (props) {
    super(props)

    this.commentBodyRef = ref => { this.commentBody = ref }

    this.measure = () => {
      let measured = {}
      if (this.commentBody) {
        const rect = this.commentBody.getBoundingClientRect()
        measured = {
          commentBodyHeight: rect.height,
          isMobile: window.innerWidth < mBreakPoint
        }
      }
      return measured
    }

    this.maybeCollapse = () => {
      if (!this.props.onShouldCollapse) {
        return
      }
      const { commentBodyHeight, isMobile } = this.measure()
      if (
        commentBodyHeight &&
        commentBodyHeight >
          (isMobile ? COLLAPSED_HEIGHT.mobile : COLLAPSED_HEIGHT.desktop) +
            COLLAPSED_HEIGHT.threshold
      ) {
        this.props.onShouldCollapse && this.props.onShouldCollapse()
      }
    }
  }

  componentDidMount() {
    this.maybeCollapse()
  }

  componentDidUpdate() {
    this.maybeCollapse()
  }

  render () {
    const {
      t,
      id,
      timeago,
      createdAt,
      updatedAt,
      published = true,
      userCanEdit,
      adminUnpublished,
      displayAuthor,
      content,
      children,
      highlighted,
      collapsed,
      context,
      Link
    } = this.props

    return (
      <div data-comment-id={id} {...styles.container} {...(highlighted ? styles.highlight: {})}>
        <CommentHeader
          {...displayAuthor}
          highlighted={highlighted}
          Link={Link}
          t={t}
          commentId={id}
          createdAt={createdAt}
          updatedAt={updatedAt}
          timeago={timeago}
        />

        {!published && <div {...styles.body}>
          {t('styleguide/comment/unpublished')}
        </div>}
        <div {...styles.body}
          {...(collapsed ? styles.bodyCollapsed : undefined)}
          style={{opacity: published ? 1 : 0.5}}
          ref={this.commentBodyRef}>
          {context && context.title && (
            <div {...styles.context}>
              <CommentContext {...context} />
            </div>
          )}
          {children || (!!content && renderMdast(content, schema, { MissingNode }))}
        </div>

        {adminUnpublished && userCanEdit && <div {...styles.body}>
          {t('styleguide/comment/adminUnpublished')}
        </div>}
        {!adminUnpublished && !published && userCanEdit && <Label {...styles.margin}>
          {t('styleguide/comment/unpublished/userCanEdit')}
        </Label>}
      </div>
    )
  }
}

export default Comment
