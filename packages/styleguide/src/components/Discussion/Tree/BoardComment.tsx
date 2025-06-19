import React from 'react'
import { css } from 'glamor'
import CommentNode, { CommentProps } from './CommentNode'
import { CommentEmbed } from '../Internal/Comment'
import { mUp } from '../../../theme/mediaQueries'

const styles = {
  wrapper: css({
    marginTop: 10,
    marginBottom: 50,
    [mUp]: {
      display: 'flex',
      marginLeft: -10,
      marginRight: -10,
    },
  }),
  item: css({
    [mUp]: {
      padding: 10,
      width: '50%',
      flex: '1 0 auto',
    },
  }),
}

const BoardComment = (props: CommentProps) => (
  <div {...styles.wrapper}>
    <div {...styles.item}>
      <CommentNode {...props} isBoard />
    </div>
    {props.comment?.embed && (
      <div {...styles.item}>
        <CommentEmbed
          embed={props.comment.embed}
          mentioningDocument={undefined}
        />
      </div>
    )}
  </div>
)

export default BoardComment
