import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

import {Comment, CommentActions} from '../Comment'
import {profilePictureSize, profilePictureMargin} from '../Comment/CommentHeader'
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

const Row = ({t, visualDepth, head, tail, otherChild, comment, displayAuthor, showComposer, composerError, onEditPreferences, onAnswer, edit, onUnpublish, onUpvote, onDownvote, dismissComposer, submitComment, timeago}) => {
  const isEditing = edit && edit.isEditing
  const {createdAt, score} = comment

  return (
    <div {...styles.root}>
      <DepthBars count={visualDepth - (otherChild ? 1 : 0)} head={head} tail={tail} />
      <div style={{flexGrow: 1, margin: otherChild ? '20px 0' : `20px 0 20px -${profilePictureSize + profilePictureMargin}px`}}>
        {!isEditing && <Comment
          {...comment}
          timeago={timeago(createdAt)}
          t={t}
        />}
        {isEditing && (
          <div style={{marginBottom: 20}}>
            <CommentComposer
              t={t}
              initialText={comment.content}
              displayAuthor={displayAuthor}
              error={edit.error}
              onEditPreferences={onEditPreferences}
              onCancel={edit.cancel}
              submitComment={edit.submit}
              submitLabel={t('styleguide/comment/edit/submit')}
            />
          </div>
        )}

        <div style={{marginLeft: profilePictureSize + profilePictureMargin}}>
          <CommentActions
            t={t}
            score={score}
            onAnswer={onAnswer}
            onEdit={edit && edit.start}
            onUnpublish={onUnpublish}
            onUpvote={onUpvote}
            onDownvote={onDownvote}
          />

          {(displayAuthor && showComposer) &&
            <Composer
              t={t}
              displayAuthor={displayAuthor}
              error={composerError}
              onEditPreferences={onEditPreferences}
              onCancel={dismissComposer}
              submitComment={submitComment}
            />
          }
        </div>
      </div>
    </div>
  )
}

Row.propTypes = {
  t: PropTypes.func.isRequired,
  visualDepth: PropTypes.number.isRequired,
  head: PropTypes.bool.isRequired,
  tail: PropTypes.bool.isRequired,
  otherChild: PropTypes.bool,
  comment: PropTypes.object.isRequired,
  displayAuthor: PropTypes.object,
  showComposer: PropTypes.bool.isRequired,
  composerError: PropTypes.string,
  onEditPreferences: PropTypes.func.isRequired,
  onAnswer: PropTypes.func,
  onUpvote: PropTypes.func,
  onDownvote: PropTypes.func,
  dismissComposer: PropTypes.func.isRequired,
  submitComment: PropTypes.func.isRequired,
  timeago: PropTypes.func.isRequired,
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
    const {t, displayAuthor, error, onEditPreferences, onCancel, submitComment} = this.props
    const {isVisible} = this.state

    return (
      <div {...styles.commentComposerContainer} style={{opacity: isVisible ? 1 : 0}}>
        <CommentComposer
          t={t}
          displayAuthor={displayAuthor}
          error={error}
          onEditPreferences={onEditPreferences}
          onCancel={onCancel}
          submitComment={submitComment}
        />
      </div>
    )
  }
}

Composer.propTypes = {
  t: PropTypes.func.isRequired,
  displayAuthor: PropTypes.object.isRequired,
  error: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  submitComment: PropTypes.func.isRequired,
}

export default Row
