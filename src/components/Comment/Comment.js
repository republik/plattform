import React from 'react'
import {css} from 'glamor'
import {fontFamilies} from '../..//theme/fonts'

import CommentHeader from './CommentHeader'
import CommentActions from './CommentActions'

const commentStyles = {
  body: css({
    fontFamily: fontFamilies.serifRegular,
    fontSize: '14px',
    lineHeight: '19px',
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
