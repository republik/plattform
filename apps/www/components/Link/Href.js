import Link from 'next/link'

const HrefLink = ({ href, passHref, children }) => {
  if (!href) {
    return children
  }

  return (
    <Link href={href} passHref={passHref} prefetch={false} legacyBehavior>
      {children}
    </Link>
  )
}
export default HrefLink
