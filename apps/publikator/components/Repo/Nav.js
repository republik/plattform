import Head from 'next/head'
import Link from 'next/link'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import { css } from 'glamor'
import { colors, A } from '@project-r/styleguide'
import withT from '../../lib/withT'
import { intersperse } from '../../lib/utils/helpers'
import { getRepoIdFromQuery } from '../../lib/repoIdHelper'

const styles = {
  disabled: css({
    color: colors.disabled,
  }),
}

const menu = [
  {
    key: 'edit',
    makeHref: (repoId) => `/repo/${repoId}/edit`,
  },
  {
    key: 'tree',
    makeHref: (repoId) => `/repo/${repoId}/tree`,
  },
]

const Nav = ({ router, route, isNew, prefix, t }) => {
  const repoId = getRepoIdFromQuery(router.query)

  const params = {
    repoId: repoId.split('/'),
  }

  const renderLink = (item) => {
    const label = t(`repo/nav/${prefix}/${item.key}`)
    if (item.makeHref(repoId) === route) {
      return <span key={item.key}>{label} </span>
    }
    if (isNew && item.key === 'tree') {
      return (
        <span key={item.key} {...styles.disabled}>
          {label}{' '}
        </span>
      )
    }
    return (
      <Link key={item.key} href={item.makeHref(repoId)} passHref>
        <A>{label} </A>
      </Link>
    )
  }

  return (
    <span>
      <Head>
        <title>
          {route.split('/')[1]}: {params.repoId[1]} – Publikator
        </title>
      </Head>
      {intersperse(menu.map(renderLink), (_, i) => (
        <span key={i}>&nbsp;</span>
      ))}
    </span>
  )
}

export default compose(withT, withRouter)(Nav)
