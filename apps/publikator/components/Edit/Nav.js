import Frame from '../Frame'
import { withRouter } from 'next/router'
import { getRepoIdFromQuery } from '../../lib/repoIdHelper'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'
import Link from 'next/link'
import { css } from 'glamor'
import { A } from '@project-r/styleguide'

const styles = {
  navLink: css({
    paddingRight: 10,
  }),
}

const NavLink = ({ children, active, href, replace }) => {
  if (active) return <span {...styles.navLink}>{children}</span>
  return (
    <span {...styles.navLink}>
      <Link href={href} passHref replace={replace}>
        <A>{children}</A>
      </Link>
    </span>
  )
}

const Nav = ({ router: { query, asPath }, t, isTemplate, isNew }) => {
  const repoId = getRepoIdFromQuery(query)
  const editPath = `/repo/${repoId}/edit`
  const treePath = `/repo/${repoId}/tree`
  const currentPath = asPath.split('?')[0]
  const editQuery =
    currentPath === editPath && query.commitId
      ? { commitId: query.commitId }
      : undefined
  return (
    <Frame.Nav>
      <NavLink
        href={{ pathname: editPath, query: editQuery }}
        active={currentPath === editPath && !query.preview}
      >
        {t(`repo/nav/${isTemplate ? 'template' : 'document'}/edit`)}
      </NavLink>
      {!isNew && (
        <NavLink
          href={{
            pathname: editPath,
            query: { ...editQuery, preview: true },
          }}
          active={currentPath === editPath && query.preview}
        >
          Vorschau
        </NavLink>
      )}
      {!isNew && (
        <NavLink href={treePath} active={currentPath === treePath}>
          Versionen
        </NavLink>
      )}
    </Frame.Nav>
  )
}

export default compose(withRouter, withT)(Nav)
