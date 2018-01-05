import React from 'react'
import { css } from 'glamor'
import { serifRegular14 } from '../Typography/styles'
import CommentHeader, { profilePictureSize, profilePictureMargin } from './CommentHeader'
import { Label } from '../Typography'

const styles = {
  margin: css({
    display: 'block',
    marginLeft: profilePictureSize + profilePictureMargin,
    marginBottom: 12,
    marginTop: 12
  }),
  body: css({
    margin: `12px 0 12px ${profilePictureSize + profilePictureMargin}px`,
    ...serifRegular14
  })
}

export const Comment = ({t, timeago, published = true, userCanEdit, adminUnpublished, displayAuthor, score, content}) => (
  <div>
    <CommentHeader
      {...displayAuthor}
      timeago={timeago}
    />

    {!published && <div {...styles.body}>
      {t('styleguide/comment/unpublished')}
    </div>}
    <div {...styles.body} style={{opacity: published ? 1 : 0.5}}>
      {content}
    </div>

    {adminUnpublished && userCanEdit && <div {...styles.body}>
      {t('styleguide/comment/adminUnpublished')}
    </div>}
    {!adminUnpublished && !published && userCanEdit && <Label {...styles.margin}>
      {t('styleguide/comment/unpublished/userCanEdit')}
    </Label>}
  </div>
)

export default Comment
