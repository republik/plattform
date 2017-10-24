import React, {PureComponent} from 'react'
import {css} from 'glamor'
import PropTypes from 'prop-types'

import {Comment, CommentActions} from '../Comment'
import CommentComposer from '../CommentComposer/CommentComposer'
import LoadMore from './LoadMore'

const styles = {
  root: css({
    margin: '40px 0',

    '&:first-child': {
      marginTop: '0'
    },
    '&:last-child': {
      marginBottom: '0'
    }
  }),
  rootBorder: css({
    paddingLeft: '14px',
    borderLeft: '1px solid #DBDBDB'
  }),
  commentComposerContainer: css({
    marginTop: '20px'
  }),
  childrenContainer: css({
    margin: '40px 0 40px 15px'
  }),
}

const Composer = ({t, displayAuthor, onCancel, submitComment}) => (
  <div {...styles.commentComposerContainer}>
    <CommentComposer
      t={t}
      displayAuthor={displayAuthor}
      onCancel={onCancel}
      submitComment={submitComment}
    />
  </div>
)

class Node extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      showComposer: false
    }

    this.openComposer = () => {
      this.setState({showComposer: true})
    }
    this.dismissComposer = () => {
      this.setState({showComposer: false})
    }

    this.upvoteComment = () => {
      this.props.upvoteComment(this.props.comment.id)
    }
    this.downvoteComment = () => {
      this.props.downvoteComment(this.props.comment.id)
    }
    this.submitComment = (content) => {
      this.props.submitComment(this.props.comment.id, content)
      this.dismissComposer()
    }
    this.fetchMore = () => {
      const {comment: {id, comments}, fetchMore} = this.props
      if (comments && comments.pageInfo) {
        fetchMore(id, comments.pageInfo.endCursor)
      } else {
        fetchMore(id, undefined)
      }
    }
  }

  render () {
    const {t, top, displayAuthor, comment, timeago} = this.props
    const {showComposer} = this.state

    const {score, comments, userVote} = comment

    const onUpvote = userVote === 'UP' ? undefined : this.upvoteComment
    const onDownvote = userVote === 'DOWN' ? undefined : this.downvoteComment

    if (comments === undefined) {
      // This comment doesn't have any replies.
      return (
        <div {...styles.root}>
          <Comment
            timeago={timeago(comment.createdAt)}
            {...comment}
          />

          <CommentActions
            t={t}
            score={score}
            onAnswer={this.openComposer}
            onUpvote={onUpvote}
            onDownvote={onDownvote}
          />

          {showComposer &&
            <Composer
              t={t}
              displayAuthor={displayAuthor}
              onCancel={this.dismissComposer}
              submitComment={this.submitComment}
            />
          }
        </div>
      )
    }

    const {totalCount, pageInfo, nodes} = comments

    const tail = (() => {
      if (pageInfo && pageInfo.hasNextPage) {
        return (
          <LoadMore
            t={t}
            count={totalCount - (nodes ? nodes.length : 0)}
            onClick={this.fetchMore}
          />
        )
      } else {
        return null
      }
    })()

    return (
      <div {...styles.root} {...(top ? styles.rootBorder : {})}>
        <Comment
          timeago={timeago(comment.createdAt)}
          {...comment}
        />

        <CommentActions
          t={t}
          score={score}
          onAnswer={this.openComposer}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
        />

        {showComposer &&
          <Composer
            t={t}
            displayAuthor={displayAuthor}
            onCancel={this.dismissComposer}
            submitComment={this.submitComment}
          />
        }

        {(() => {
          if (nodes.length === 0) {
            if (tail) {
              return (
                <div {...styles.childrenContainer}>
                  {tail}
                </div>
              )
            } else {
              return null
            }
          } else {
            const [firstChild, ...otherChildren] = nodes

            return [
              <div key='otherChildren' {...styles.childrenContainer}>
                {otherChildren.map((c, i) => (
                  <Node
                    {...this.props}
                    key={i}
                    top={true}
                    comment={c}
                  />
                ))}
                {tail}
              </div>,
              <Node
                {...this.props}
                top={false}
                key='firstChild'
                comment={firstChild}
              />
            ]
          }
        })()}
      </div>
    )
  }
}

Node.propTypes = {
  t: PropTypes.func.isRequired,
  displayAuthor: PropTypes.object.isRequired,
  comment: PropTypes.object.isRequired,
  timeago: PropTypes.func.isRequired,
  upvoteComment: PropTypes.func.isRequired,
  downvoteComment: PropTypes.func.isRequired,
  submitComment: PropTypes.func.isRequired,
  fetchMore: PropTypes.func.isRequired,
}

export default Node
