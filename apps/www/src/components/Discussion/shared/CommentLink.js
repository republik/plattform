import { PUBLIC_BASE_URL } from '@/lib/constants'
import Link from 'next/link'

export const getFocusHref = (discussion, comment) => {
  const pathPrefix =
    discussion.document?.meta?.template === 'article' ? '/dialog' : ''

  const href = comment?.id
    ? `${pathPrefix}${discussion.path}?focus=${comment.id}`
    : `${pathPrefix}${discussion.path}`

  return href
}

export const getFocusUrl = (discussion, comment) => {
  const focusHref = getFocusHref(discussion, comment)
  const focusUrl = new URL(focusHref, PUBLIC_BASE_URL)
  return focusUrl.toString()
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
