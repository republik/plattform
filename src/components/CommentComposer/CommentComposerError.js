import React from 'react'
import {css} from 'glamor'
import colors from '../../theme/colors'
import {sansSerifRegular16} from '../Typography/styles'

const styles = {
  root: css({
    ...sansSerifRegular16,
    color: colors.error,
    marginTop: 12
  })
}

const CommentComposerError = ({children}) => (
  <div {...styles.root}>
    {children}
  </div>
)

export default CommentComposerError
