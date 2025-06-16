import { ReactElement } from 'react'
import { inQuotes } from '@project-r/styleguide'

import { useDiscussion } from '../DiscussionContext'
import Meta from '../../../Frame/Meta'
import { getFocusUrl } from '../../shared/CommentLink'
import { useTranslation } from '../../../../lib/withT'
import { PUBLIC_BASE_URL } from '../../../../lib/constants'

/**
 * Render meta tags for a focused comment.
 * @constructor
 */
const DiscussionMetaHelper = ({
  parentId,
  includeParent,
}: {
  parentId?: string
  includeParent?: boolean
}): ReactElement => {
  const { t } = useTranslation()
  const { discussion, loading, error } = useDiscussion()

  if (loading || error || !discussion) {
    return null
  }

  const metaFocus =
    discussion.comments.focus ||
    (includeParent &&
      parentId &&
      discussion.comments.nodes.find((n) => n.id === parentId))

  if (metaFocus) {
    return (
      <Meta
        data={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          title: t('discussion/meta/focus/title', {
            authorName: metaFocus.displayAuthor.name,
            quotedDiscussionTitle: inQuotes(discussion.title),
          }),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          description: metaFocus.preview ? metaFocus.preview.string : undefined,
          url: `${PUBLIC_BASE_URL}/dialog${discussion.path}`,
        }}
      />
    )
  }

  return null
}

export default DiscussionMetaHelper
