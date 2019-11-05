import React from 'react'
import { css } from 'glamor'

import { Collapsable } from '../../../Collapsable'
import { DiscussionContext } from '../../DiscussionContext'
import { Label } from '../../../Typography'

import { Context } from './Context'
import { renderCommentMdast } from './render'

const styles = {
  container: css({
    position: 'relative'
  }),
  margin: css({
    display: 'block',
    marginTop: 8
  }),
  unpublished: css({
    marginBottom: 8
  }),
  context: css({
    marginBottom: 10
  })
}

export const Body = ({ t, comment, context }) => {
  const { discussion, highlightedCommentId } = React.useContext(
    DiscussionContext
  )
  const { collapsable } = discussion
  const { published, content, userCanEdit, adminUnpublished } = comment

  const isHighlighted = highlightedCommentId === comment.id

  const body = (
    <>
      {content && context && context.title && (
        <div {...styles.context}>
          <Context {...context} />
        </div>
      )}
      {content && renderCommentMdast(content)}
    </>
  )
  const bodyNode =
    collapsable && !isHighlighted ? (
      <Collapsable
        t={t}
        collapsable={collapsable && !isHighlighted}
        style={{ opacity: published ? 1 : 0.5 }}
      >
        {body}
      </Collapsable>
    ) : (
      body
    )

  return (
    <>
      {!published && (
        <div {...styles.unpublished}>{t('styleguide/comment/unpublished')}</div>
      )}
      {bodyNode}
      {userCanEdit &&
        (() => {
          if (adminUnpublished) {
            return (
              <Label {...styles.margin}>
                {t('styleguide/comment/adminUnpublished')}
              </Label>
            )
          } else if (!published) {
            return (
              <Label {...styles.margin}>
                {t('styleguide/comment/unpublished/userCanEdit')}
              </Label>
            )
          } else {
            return null
          }
        })()}
    </>
  )
}
