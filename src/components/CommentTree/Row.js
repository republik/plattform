import React, {PureComponent} from 'react'
import {css} from 'glamor'

import {Comment, CommentActions} from '../Comment'
import CommentComposer from '../CommentComposer/CommentComposer'
import {DepthBars} from './DepthBar'

const styles = {
  root: css({
    display: 'flex'
  }),
  commentComposerContainer: css({
    marginTop: '20px',
    transition: 'opacity .2s'
  }),
}

const range = (n) => Array.from(new Array(n))

const Row = ({t, visualDepth, head, tail, otherChild, comment, displayAuthor, showComposer, onAnswer, onUpvote, onDownvote, dismissComposer, submitComment, timeago}) => {
  const {createdAt, score} = comment

  return (
    <div {...styles.root}>
      <DepthBars count={visualDepth} head={head} tail={tail} />
      <div style={{flexGrow: 1, padding: otherChild ? '20px 0 20px 15px' : '20px 0'}}>
        <Comment
          timeago={timeago(createdAt)}
          {...comment}
        />

        <CommentActions
          t={t}
          score={score}
          onAnswer={onAnswer}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
        />

        {showComposer &&
          <Composer
            t={t}
            displayAuthor={displayAuthor}
            onCancel={dismissComposer}
            submitComment={submitComment}
          />
        }
      </div>
    </div>
  )
}

class Composer extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {isVisible: false}
  }
  componentDidMount () {
    this.setState({isVisible: true})
  }

  render () {
    const {t, displayAuthor, onCancel, submitComment} = this.props
    const {isVisible} = this.state

    return (
      <div {...styles.commentComposerContainer} style={{opacity: isVisible ? 1 : 0}}>
        <CommentComposer
          t={t}
          displayAuthor={displayAuthor}
          onCancel={onCancel}
          submitComment={submitComment}
        />
      </div>
    )
  }
}

export default Row
