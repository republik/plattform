import { PUBLIC_BASE_URL } from 'lib/constants'
import Link from 'next/link'
import { cloneElement } from 'react'

/**
 * isLinkOfSameHost checks if a link is of the same host as the host provided.
 * @param link relative or absolute link
 * @param host hostname with protocol prefix
 * @returns boolean
 */
function isLinkOfSameHost(link: string, host: string) {
  try {
    const { origin: hostOrigin } = new URL(host)
    const { origin } = new URL(link, host)

    return origin === hostOrigin
  } catch (e) {
    return false
  }
}

const HrefLink = ({
  href,
  passHref,
  legacyBehavior = true,
  children,
  ...restProps
}) => {
  if (!href) {
    return children
  }

  const isExternalLink = !isLinkOfSameHost(href, PUBLIC_BASE_URL)

  return (
    <Link
      {...restProps}
      href={href}
      passHref={passHref}
      prefetch={false}
      legacyBehavior={legacyBehavior}
    >
      {legacyBehavior && isExternalLink
        ? cloneElement(children, { target: '_blank', rel: 'noreferrer' })
        : children}
    </Link>
  )
}
export default HrefLink
