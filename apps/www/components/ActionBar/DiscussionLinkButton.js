import { IconButton } from '@project-r/styleguide'
import { DiscussionIcon } from '@project-r/styleguide'
import { focusSelector } from '../../lib/utils/scroll'
import { getDiscussionLinkProps } from './utils'
import Link from 'next/link'

const DiscussionLinkButton = ({
  t,
  document,
  forceShortLabel,
  isOnArticlePage,
}) => {
  const meta = document && document.meta
  const {
    discussionId,
    discussionPath,
    discussionQuery,
    discussionCount,
    isDiscussionPage,
  } = getDiscussionLinkProps(
    meta.linkedDiscussion,
    meta.ownDiscussion,
    meta.template,
    meta.path,
  )

  return (
    <Link
      href={{
        pathname: discussionPath,
        query: discussionQuery,
      }}
      passHref
    >
      <IconButton
        Icon={DiscussionIcon}
        label={
          forceShortLabel
            ? discussionCount
            : t('profile/documents/title/other', {
                count: discussionCount || '',
              })
        }
        labelShort={discussionCount || ''}
        fillColorName='primary'
        onClick={
          isDiscussionPage && isOnArticlePage
            ? (e) => {
                e.preventDefault()
                focusSelector(`[data-discussion-id='${discussionId}']`)
              }
            : undefined
        }
      />
    </Link>
  )
}

export default DiscussionLinkButton
