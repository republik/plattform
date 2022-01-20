import React from 'react'
import { css } from 'glamor'
import CommentNode, { CommentProps } from './CommentNode'
import { CommentEmbed } from '../Internal/Comment'
import { mUp } from '../../../theme/mediaQueries'

const styles = {
  wrapper: css({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridAutoRows: 'auto',
    gap: 16,
    [mUp]: {
      gridTemplateColumns: '1fr 1fr'
    }
  })
}


const BoardComment = (props: CommentProps) => (
  <div {...styles.wrapper}>
    <div>
      <CommentNode {...props} isBoard={true} />
    </div>
    {props.comment?.embed && (
      <div>
        <CommentEmbed embed={props.comment?.embed} />
      </div>
    )}
  </div>
)

export default BoardComment
