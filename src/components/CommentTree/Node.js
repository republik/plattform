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
  }

  render () {
    const {Node, t, top, displayAuthor, comment} = this.props
    const {upvoteComment, downvoteComment, submitComment} = this.props
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
            upvoteComment={upvoteComment}
            downvoteComment={downvoteComment}
          />

          {showComposer &&
            <Composer
              t={t}
              displayAuthor={displayAuthor}
              onCancel={this.dismissComposer}
              submitComment={submitComment}
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
            upvoteComment={upvoteComment}
            downvoteComment={downvoteComment}
          />

          {showComposer &&
            <Composer
              t={t}
              displayAuthor={displayAuthor}
              onCancel={this.dismissComposer}
              submitComment={submitComment}
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
                  {otherChildren.map((c, i) => <Node key={i} top comment={c} />)}
                  {tail}
                </div>,
                <Node key='firstChild' comment={firstChild} />
              ]
            }
          })()}
        </div>
      )
    }
  }
}

export default Node
