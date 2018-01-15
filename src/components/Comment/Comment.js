import React from 'react'
import { css } from 'glamor'
import { serifRegular14, serifRegular16 } from '../Typography/styles'
import CommentHeader, { profilePictureSize, profilePictureMargin } from './CommentHeader'
import { Label } from '../Typography'
import { mUp } from '../../theme/mediaQueries'
import colors from '../../theme/colors'

import { intersperse } from '../../lib/helpers'

const highlightPadding = 7

const styles = {
  container: css({
    position: 'relative'
  }),
  highlight: css({
    top: -highlightPadding,
    left: -highlightPadding,
    right: -highlightPadding,
    bottom: -highlightPadding,
    padding: highlightPadding,
    width: `calc(100% + ${highlightPadding * 2}px)`,
    backgroundColor: colors.primaryBg
  }),
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

export const Comment = ({t, id, timeago, createdAt, updatedAt, published = true, userCanEdit, adminUnpublished, displayAuthor, content, highlighted, Link}) => (
  <div data-comment-id={id} {...styles.container} {...(highlighted ? styles.highlight: {})}>
    <CommentHeader
      {...displayAuthor}
      highlighted={highlighted}
      Link={Link}
      t={t}
      commentId={id}
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
            return text || all[index - 1]
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
