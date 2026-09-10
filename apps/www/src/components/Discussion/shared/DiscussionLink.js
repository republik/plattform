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

const DiscussionLink = ({ children, discussion, ...props }) => {
  if (!discussion.path) {
    return children
  }
  return (
    <Link {...props} href={`/dialog${discussion.path}`} prefetch={false}>
      {children}
    </Link>
  )
}

export default DiscussionLink
