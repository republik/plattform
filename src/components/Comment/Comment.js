import React from 'react'
import {css} from 'glamor'
import {fontFamilies} from '../../theme/fonts'
import {serifRegular14} from '../Typography/styles'
import CommentHeader from './CommentHeader'
import CommentActions from './CommentActions'

const commentStyles = {
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

    <div {...commentStyles.body}>
      {content}
    </div>
  </div>
)

export default Comment
