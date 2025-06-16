import { parse, format } from 'url'

import { PUBLIC_BASE_URL } from '../../../lib/constants'
import Link from 'next/link'

export const getFocusHref = (discussion, comment) => {
  console.log('discussion', discussion)
  const focusParams = { focus: comment?.id }
  if (discussion.document?.meta?.template === 'article') {
    return {
      pathname: `/dialog${discussion.path}`,
      query: { ...focusParams },
    }
  } else if (discussion.path) {
    const { pathname, query } = parse(discussion.path, true)
    return {
      pathname,
      query: {
        ...query,
        ...focusParams,
      },
    }
  }
}

export const getFocusUrl = (discussion, comment) => {
  const focusHref = getFocusHref(discussion, comment)
  if (focusHref) {
    const baseUrl = new URL(PUBLIC_BASE_URL)
    const { pathname, query } = focusHref
    return format({
      protocol: baseUrl.protocol.slice(0, -1), // Remove trailing ':'
      hostname: baseUrl.hostname,
      port: baseUrl.port,
      pathname,
      query,
    })
  }
}

const CommentLink = ({ displayAuthor, comment, discussion, ...props }) => {
  if (displayAuthor) {
    /*
     * If the slug is not available, it means the profile is not accessible.
     */
    if (displayAuthor.slug) {
      return (
        <Link
          {...props}
          href={`/~${displayAuthor.slug}`}
          prefetch={false}
          legacyBehavior
        />
      )
    }
  } else if (discussion) {
    const focusRoute = getFocusHref(discussion, comment)
    if (focusRoute) {
      return (
        <Link
          {...props}
          href={getFocusHref(discussion, comment)}
          prefetch={false}
          legacyBehavior
        />
      )
    }
  }

  return props.children
}

export default CommentLink
