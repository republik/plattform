import React, {PureComponent} from 'react'
import {css} from 'glamor'

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
  }

  render () {
    const {Node, t, top, displayAuthor, comment} = this.props
    const {showComposer} = this.state
    const {score, replies} = comment

    if (replies === undefined) {
      // This comment doesn't have any replies.
      return (
        <div {...styles.root}>
          <Comment
            timeago='2h'
            {...comment}
          />

          <CommentActions
            t={t}
            score={score}
            onAnswer={this.openComposer}
            onUpvote={this.upvoteComment}
            onDownvote={this.downvoteComment}
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
    } else {
      const {comments, more} = replies

      const tail = (() => {
        if (more) {
          return (
            <LoadMore t={t} count={more.count} onClick={more.load} />
          )
        } else {
          return null
        }
      })()

      return (
        <div {...styles.root} {...(top ? styles.rootBorder : {})}>
          <Comment
            timeago='2h'
            {...comment}
          />

          <CommentActions
            t={t}
            score={score}
            onAnswer={this.openComposer}
            onUpvote={this.upvoteComment}
            onDownvote={this.downvoteComment}
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
            if (comments.length === 0) {
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
              const [firstChild, ...otherChildren] = comments

              return [
                <div key='otherChildren' {...styles.childrenContainer}>
                  {otherChildren.map((c, i) => <Node key={i} top commentId={c.id} />)}
                  {tail}
                </div>,
                <Node key='firstChild' commentId={firstChild.id} />
              ]
            }
          })()}
        </div>
      )
    }
  }
}

export default Node
