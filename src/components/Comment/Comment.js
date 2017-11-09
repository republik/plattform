import React from 'react'
import {css} from 'glamor'
import {serifRegular14} from '../Typography/styles'
import CommentHeader, {profilePictureSize, profilePictureMargin} from './CommentHeader'

const styles = {
  body: css({
    ...serifRegular14,
    margin: `12px 0 12px ${profilePictureSize + profilePictureMargin}px`
  })
}

export const Comment = ({timeago, displayAuthor, score, content}) => (
  <div>
    <CommentHeader
      {...displayAuthor}
      timeago={timeago}
    />

    <div {...styles.body}>
      {content}
    </div>
  </div>
)

export default Comment
