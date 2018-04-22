import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

import {Comment, CommentActions} from '../Comment'
import {profilePictureSize, profilePictureMargin} from '../Comment/CommentHeader'
import CommentComposer from '../CommentComposer/CommentComposer'
import {DepthBars, getWidth} from './DepthBar'

const styles = {
  root: css({
    display: 'flex'
  }),
  commentComposerContainer: css({
    marginTop: '20px',
    transition: 'opacity .2s'
  }),
}

const Row = ({t, visualDepth, head, tail, otherChild, comment, displayAuthor, showComposer, composerError, onEditPreferences, onAnswer, edit, onUnpublish, onUpvote, onDownvote, dismissComposer, submitComment, highlighted, timeago, maxLength, replyBlockedMsg, Link, etiquetteLink}) => {
  const isEditing = edit && edit.isEditing
  const { score } = comment

  const barCount = visualDepth - (otherChild ? 1 : 0)

  return (
    <div {...styles.root}>
      <DepthBars count={barCount} head={head} tail={tail} />
      <div style={{flexGrow: 1, flexBasis: 0, margin: otherChild ? '20px 0' : `20px 0 20px -${profilePictureSize + profilePictureMargin}px`, width: `calc(100% - ${getWidth(barCount)}px)`}}>
        {!isEditing && <Comment
          {...comment}
          highlighted={highlighted}
          Link={Link}
          timeago={timeago}
          t={t}
        />}
        {isEditing && (
          <div style={{marginBottom: 20}}>
            <CommentComposer
              t={t}
              initialText={comment.text}
              displayAuthor={displayAuthor}
              error={edit.error}
              onEditPreferences={onEditPreferences}
              onCancel={edit.cancel}
              submitComment={edit.submit}
              submitLabel={t('styleguide/comment/edit/submit')}
              maxLength={maxLength}
              etiquetteLink={etiquetteLink}
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
            replyBlockedMsg={replyBlockedMsg}
          />

          {(displayAuthor && showComposer) &&
            <Composer
              t={t}
              displayAuthor={displayAuthor}
              error={composerError}
              onEditPreferences={onEditPreferences}
              onCancel={dismissComposer}
              submitComment={submitComment}
              maxLength={maxLength}
              etiquetteLink={etiquetteLink}
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
  maxLength: PropTypes.number,
  replyBlockedMsg: PropTypes.string
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
    const {t, displayAuthor, error, onEditPreferences, onCancel, submitComment, maxLength, etiquetteLink} = this.props
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
          maxLength={maxLength}
          etiquetteLink={etiquetteLink}
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
  maxLength: PropTypes.number
}

class RowState extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      composerState: 'idle', // idle | focused | submitting | error
      composerError: undefined // or string
    }

    this.openComposer = () => {
      this.setState({
        composerState: 'focused',
        composerError: undefined
      })
    }
    this.dismissComposer = () => {
      this.setState({
        composerState: 'idle',
        composerError: undefined
      })
    }

    this.upvoteComment = () => {
      this.props.upvoteComment(this.props.comment.id)
    }
    this.downvoteComment = () => {
      this.props.downvoteComment(this.props.comment.id)
    }
    this.submitComment = (content) => {
      this.setState({composerState: 'submitting'})
      this.props.submitComment(this.props.comment, content).then(
        () => {
          this.setState({
            composerState: 'idle',
            composerError: undefined
          })
        },
        (e) => {
          this.setState({
            composerState: 'error',
            composerError: e
          })
        }
      )
    }
  }

  render () {
    const {
      t,
      timeago,
      comment,
      highlighted,
      visualDepth, head, tail,
      otherChild,
      displayAuthor,
      onEditPreferences,
      isAdmin,
      maxLength,
      replyBlockedMsg,
      Link,
      etiquetteLink
    } = this.props
    const {composerState, composerError} = this.state
    const {userVote} = comment

    const edit = comment.userCanEdit && {
      start: () => {
        this.setState({
          isEditing: true,
          editError: undefined
        })
      },
      submit: content => {
        this.props.editComment(comment, content)
          .then(() => {
            this.setState({
              isEditing: false
            })
          })
          .catch(e => {
            this.setState({
              editError: e
            })
          })
      },
      cancel: () => {
        this.setState({
          isEditing: false
        })
      },
      isEditing: this.state.isEditing,
      error: this.state.editError
    }

    return (
      <Row
        t={t}
        visualDepth={visualDepth}
        head={head}
        tail={tail}
        otherChild={otherChild}
        comment={comment}
        highlighted={highlighted}
        displayAuthor={displayAuthor}
        showComposer={composerState !== 'idle'}
        composerError={composerError}
        onEditPreferences={onEditPreferences}
        onAnswer={displayAuthor ? this.openComposer : undefined}
        onUpvote={(!displayAuthor || userVote === 'UP') ? undefined : this.upvoteComment}
        onDownvote={(!displayAuthor || userVote === 'DOWN') ? undefined : this.downvoteComment}
        onUnpublish={(isAdmin || comment.userCanEdit) && comment.published && (() => this.props.unpublishComment(comment.id))}
        dismissComposer={this.dismissComposer}
        submitComment={this.submitComment}
        edit={edit}
        timeago={timeago}
        maxLength={maxLength}
        replyBlockedMsg={replyBlockedMsg}
        Link={Link}
        etiquetteLink={etiquetteLink}
      />
    )
  }

}

export default RowState
