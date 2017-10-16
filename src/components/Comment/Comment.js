import React from 'react'
import {css} from 'glamor'
import {serifRegular14} from '../Typography/styles'
import CommentHeader from './CommentHeader'

const styles = {
  body: css({
    ...serifRegular14,
    margin: '10px 0'
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
