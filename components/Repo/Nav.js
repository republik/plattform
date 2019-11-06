import React from 'react'
import { compose } from 'react-apollo'
import { withRouter } from 'next/router'
import { Link } from '../../lib/routes'
import { css } from 'glamor'
import { colors, linkRule } from '@project-r/styleguide'
import withT from '../../lib/withT'
import { intersperse } from '../../lib/utils/helpers'

const styles = {
  disabled: css({
    color: colors.disabled
  })
}

const menu = [
  {
    key: 'edit',
    route: 'repo/edit'
  },
  {
    key: 'tree',
    route: 'repo/tree'
  }
]

const Nav = ({ router, route, isNew, t }) => {
  const { repoId } = router.query

  const params = {
    repoId: repoId.split('/')
  }

  return (
    <span>
      {intersperse(
        menu.map(item => {
          const label = t(`repo/nav/${item.key}`)
          if (item.route === route) {
            return <span key={item.route}>{label} </span>
          }
          if (isNew && item.key === 'tree') {
            return (
              <span key={item.route} {...styles.disabled}>
                {label}{' '}
              </span>
            )
          }
          return (
            <Link key={item.route} route={item.route} params={params}>
              <a {...linkRule}>{label} </a>
            </Link>
          )
        }),
        (_, i) => (
          <span key={i}>&nbsp;</span>
        )
      )}
    </span>
  )
}

export default compose(
  withT,
  withRouter
)(Nav)
