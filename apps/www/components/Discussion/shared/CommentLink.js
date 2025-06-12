import { parse, format } from 'url'

import {
  GENERAL_FEEDBACK_DISCUSSION_ID,
  PUBLIC_BASE_URL,
} from '../../../lib/constants'
import Link from 'next/link'

export const getFocusHref = (discussion, comment) => {
  const focusParams = comment
    ? discussion.isBoard
      ? comment.parentIds && comment.parentIds.length
        ? { parent: comment.parentIds[0], focus: comment.id }
        : { parent: comment.id }
      : { focus: comment.id }
    : {}
  if (discussion.id === GENERAL_FEEDBACK_DISCUSSION_ID) {
    return {
      pathname: '/feedback',
      query: { ...focusParams },
    }
  } else if (
    discussion.document?.meta &&
    discussion.document?.meta?.template === 'article' &&
    discussion.document?.meta?.ownDiscussion &&
    discussion.document?.meta?.ownDiscussion?.id === discussion.id
  ) {
    return {
      pathname: `/dialog/${discussion.path}`,
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
    const [protocol, hostname] = PUBLIC_BASE_URL.split('://')
    const { pathname, query } = focusHref
    return format({ protocol, hostname, pathname, query })
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
