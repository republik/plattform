import React, { ComponentPropsWithoutRef } from 'react'
import { css } from 'glamor'

import { Collapsable } from '../../../Collapsable'
import { DiscussionContext } from '../../DiscussionContext'
import { Label } from '../../../Typography'

import { Context } from './Context'
import { renderCommentMdast } from './render'
import { Formatter } from '../../../../lib/translate'
import { Comment } from './types'

const styles = {
  container: css({
    position: 'relative',
  }),
  margin: css({
    display: 'block',
    marginTop: 8,
  }),
  unpublished: css({
    marginBottom: 8,
  }),
  context: css({
    marginBottom: 10,
  }),
}

type BodyProps = {
  t: Formatter
  comment: Comment
  context: ComponentPropsWithoutRef<typeof Context>
  isPreview?: boolean
  isHighlighted?: boolean
}

export const Body = ({
  t,
  comment,
  context,
  isPreview = false,
  isHighlighted = false,
}: BodyProps) => {
  const { discussion } = React.useContext(DiscussionContext)
  const { collapsable } = discussion as { collapsable: boolean }
  const { published, content, userCanEdit, adminUnpublished } = comment

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
        // collapsable={collapsable && !isHighlighted}
        style={{ opacity: published || isPreview ? 1 : 0.5 }}
      >
        {body}
      </Collapsable>
    ) : (
      body
    )

  return (
    <>
      {bodyNode}
      {!isPreview &&
        userCanEdit &&
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
