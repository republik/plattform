import * as React from 'react'
import Link from 'next/link'

export default ({ pathname }: any) => {
  const indexClassName: string | undefined =
    pathname === '/' ? 'is-active' : undefined

  const aboutClassName: string | undefined =
    pathname === '/about' ? 'is-active' : undefined

  return (
    <header>
      <Link prefetch href="/">
        <a className={indexClassName}>Home</a>
      </Link>

      <Link prefetch href="/about">
        <a className={aboutClassName}>About</a>
      </Link>

      <style>{`
        header {
          margin-bottom: 25px;
        }
        a {
          font-size: 14px;
          margin-right: 15px;
          text-decoration: none;
        }
        .is-active {
          text-decoration: underline;
        }
      `}</style>
    </header>
  )
}
