import React from 'react'
import { css } from 'glamor'
import CommentNode, { CommentProps, commentPropTypes } from './CommentNode'
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

const propTypes = commentPropTypes

const BoardComment = (props: CommentProps) => (
  <div {...styles.wrapper}>
    <div>
      <CommentNode {...props} isBoard={true} />
    </div>
    <div>
      <CommentEmbed embed={props.comment?.embed} />
    </div>
  </div>
)

export default BoardComment

BoardComment.propTypes = propTypes
