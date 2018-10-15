import React, { Component } from 'react'
import { css } from 'glamor'
import { renderMdast } from 'mdast-react-render'

import { Label } from '../Typography'

import colors from '../../theme/colors'
import { mBreakPoint, mUp } from '../../theme/mediaQueries'

import createCommentSchema from '../../templates/Comment'

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
      if (this.commentBody) {
        const rect = this.commentBody.getBoundingClientRect()
        this.commentBodyHeight = rect.height
        this.isMobile = window.innerWidth < mBreakPoint
      }
    }

    this.maybeCollapse = () => {
      if (!this.props.onShouldCollapse) {
        return
      }
      this.measure()
      if (
        this.commentBodyHeight &&
        this.commentBodyHeight >
          (this.isMobile ? COLLAPSED_HEIGHT.mobile : COLLAPSED_HEIGHT.desktop) +
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
      highlighted,
      collapsed,
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
          {!!content && renderMdast(content, schema, { MissingNode })}
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
