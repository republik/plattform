import React from 'react'
import { intersperse } from './utils/helpers'
import Link from 'next/link'
import { useRouter } from 'next/router'

const links = [
  {
    path: '/news',
    title: 'Aktuelles',
  },
  {
    path: '/manifest',
    title: 'Manifest',
  },
  {
    path: '/jobs',
    title: 'Jobs',
  },
  {
    path: '/en',
    title: 'English',
  },
]

const Menu = () => {
  const { pathname } = useRouter()
  return (
    <p>
      {intersperse(
        links.map(({ path, title }, i) => {
          if (path === pathname) {
            return title
          }
          return (
            <Link key={i} href={path}>
              {title}
            </Link>
          )
        }),
        ' – ',
      )}
    </p>
  )
}

export default Menu
