import React from 'react'
import { Link } from '../../lib/routes'
import { linkRule } from '@project-r/styleguide'
import withT from '../../lib/withT'

const menu = [
  {
    key: 'edit',
    label: 'Edit',
    route: 'repo/edit'
  },
  {
    key: 'tree',
    label: 'Tree',
    route: 'repo/tree'
  },
  {
    key: 'publish',
    label: 'Publish',
    route: 'repo/publish'
  }
]

const Nav = ({url, route, t}) => {
  const { repoId } = url.query

  const params = {
    repoId: repoId.split('/')
  }

  return (
    <span>
      {menu.map(item => {
        const label = t(`repo/nav/${item.key}`)
        if (item.route === route) {
          return <span key={item.route}>{label}{' '}</span>
        }
        return (
          <Link
            key={item.route}
            route={item.route}
            params={params}
          >
            <a {...linkRule}>
              {label}
              {' '}
            </a>
          </Link>
        )
      })}
    </span>
  )
}

export default withT(Nav)
