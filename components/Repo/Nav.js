import React from 'react'
import { Link } from '../../lib/routes'
import { linkRule } from '@project-r/styleguide'
import withT from '../../lib/withT'

const menu = [
  {
    key: 'edit',
    label: 'Edit',
    route: 'editor/edit'
  },
  {
    key: 'tree',
    label: 'Tree',
    route: 'editor/tree'
  },
  {
    key: 'publish',
    label: 'Publish',
    route: 'editor/publish'
  }
]

const Nav = ({url, route, t}) => {
  const { repository } = url.query

  // ToDo: missing latest commit id (at least for edit and meta)
  const params = {
    repository
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
