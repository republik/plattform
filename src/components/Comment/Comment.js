import React from 'react'
import { css } from 'glamor'
import { serifRegular14, serifRegular16 } from '../Typography/styles'
import CommentHeader, { profilePictureSize, profilePictureMargin } from './CommentHeader'
import { Label } from '../Typography'
import { mUp } from '../../theme/mediaQueries'

import { intersperse } from '../../lib/helpers'

const styles = {
  margin: css({
    display: 'block',
    marginLeft: profilePictureSize + profilePictureMargin,
    marginBottom: 12,
    marginTop: 12
  }),
  body: css({
    margin: `12px 0 12px ${profilePictureSize + profilePictureMargin}px`,
    ...serifRegular14,
    [mUp]: {
      ...serifRegular16
    }
  })
}

export const Comment = ({t, timeago, createdAt, updatedAt, published = true, userCanEdit, adminUnpublished, displayAuthor, content, Link}) => (
  <div>
    <CommentHeader
      {...displayAuthor}
      Link={Link}
      t={t}
      createdAt={createdAt}
      updatedAt={updatedAt}
      timeago={timeago}
    />

    {!published && <div {...styles.body}>
      {t('styleguide/comment/unpublished')}
    </div>}
    <div {...styles.body} style={{opacity: published ? 1 : 0.5}}>
      {intersperse(
        (content || '').trim().split('\n')
          .map(text => text.trim())
          .filter((text, index, all) => {
            // prevent more than two brs in a row
            return text || all[index - 1] || all[index - 2]
          })
        ,
        (_, i) => <br key={i} />
      )}
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
