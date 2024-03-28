import { GENERAL_FEEDBACK_DISCUSSION_ID } from '../../../lib/constants'
import Link from 'next/link'

export const rerouteDiscussion = (route, targetQuery) => {
  const {
    pathname,
    query: { focus, ...restQuery },
  } = route

  const query = {
    ...restQuery,
    ...targetQuery,
  }

  const params = ['tag', 'order']

  params.forEach((param) => {
    if (query[param] === undefined) {
      delete query[param]
    }
  })

  return {
    pathname,
    query,
  }
}

export const getDiscussionUrlObject = (discussion) => {
  let tab
  if (discussion && discussion.document) {
    const meta = discussion.document.meta || {}
    const ownDiscussion = meta.ownDiscussion && !meta.ownDiscussion.closed
    const template = meta.template
    tab = ownDiscussion && template === 'article' && 'article'
  }
  tab =
    tab ||
    (discussion &&
      discussion.id === GENERAL_FEEDBACK_DISCUSSION_ID &&
      'general')
  if (tab) {
    return {
      pathname: '/dialog',
      query: { t: tab, id: tab === 'general' ? undefined : discussion.id },
    }
  }
  if (discussion) {
    return {
      pathname:
        discussion.document &&
        discussion.document.meta &&
        discussion.document.meta.path
          ? discussion.document.meta.path
          : discussion.path,
      query: {},
    }
  }
}

const DiscussionLink = ({ children, discussion }) => {
  const href = getDiscussionUrlObject(discussion)
  if (href) {
    return (
      <Link href={href} passHref prefetch={false} legacyBehavior>
        {children}
      </Link>
    );
  }
  return children
}

export default DiscussionLink
