import { IconButton } from '@project-r/styleguide'
import { focusSelector } from '../../lib/utils/scroll'
import { getDiscussionLinkProps } from './utils'
import Link from 'next/link'
import { IconDiscussion } from '@republik/icons'

const DiscussionLinkButton = ({
  t,
  document,
  forceShortLabel,
  useCallToActionLabel = false,
  isOnArticlePage,
}) => {
  const meta = document && document.meta
  const { discussionId, discussionPath, discussionCount, isDiscussionPage } =
    getDiscussionLinkProps(
      meta.linkedDiscussion,
      meta.ownDiscussion,
      meta.template,
      meta.path,
    )

  const getLabel = () => {
    if (useCallToActionLabel) {
      return t.pluralize('article/actionbar/discussion/call-to-action', {
        count: discussionCount || 0,
      })
    }

    if (forceShortLabel) {
      return discussionCount
    }

    return t.pluralize('article/actionbar/discussion/label', {
      count: discussionCount || 0,
    })
  }

  return (
    <Link
      href={{
        pathname: discussionPath,
      }}
      passHref
      prefetch={false}
      legacyBehavior
    >
      <IconButton
        Icon={IconDiscussion}
        label={getLabel()}
        labelShort={useCallToActionLabel ? getLabel() : discussionCount}
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
