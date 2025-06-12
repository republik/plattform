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
  const meta = discussion?.document?.meta
  if (!meta) {
    return null
  }
  // article dialog pages start with  pathname /dialog
  if (meta.template === 'article') {
    return {
      pathname: `/dialog/${discussion.path}`,
    }
  } else {
    // discussion pages have discussions integrated on the same page
    return {
      pathname: meta.path || discussion.path,
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
    )
  }
  return children
}

export default DiscussionLink
