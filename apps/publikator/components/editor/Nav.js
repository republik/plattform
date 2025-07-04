import Frame from '../Frame'
import { withRouter } from 'next/router'
import { getRepoIdFromQuery } from '../../lib/repoIdHelper'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'
import Link from 'next/link'
import { css } from 'glamor'
import { A } from '@project-r/styleguide'
import Head from 'next/head'

const styles = {
  navLink: css({
    paddingRight: 10,
  }),
}

const NavLink = ({ children, active, href, replace }) => {
  if (active) return <span {...styles.navLink}>{children}</span>
  return (
    <span {...styles.navLink}>
      <Link href={href} passHref replace={replace} legacyBehavior>
        <A>{children}</A>
      </Link>
    </span>
  )
}

const Nav = ({ router: { query, asPath }, t, isTemplate, isNew }) => {
  const repoId = getRepoIdFromQuery(query)
  const editPath = `/repo/${repoId}/edit`
  const treePath = `/repo/${repoId}/tree`
  const filesPath = `/repo/${repoId}/files`
  const currentPath = asPath.split('?')[0]
  const editQuery =
    currentPath === editPath && query.commitId
      ? { commitId: query.commitId }
      : undefined
  return (
    <Frame.Nav>
      <Head>
        <title>
          {`${query.preview ? 'preview' : currentPath.split('/').slice(-1)}: ${
            repoId.split('/')[1]
          } – Publikator`}
        </title>
      </Head>
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
      {!isNew && (
        <NavLink href={filesPath} active={currentPath === filesPath}>
          Dateien
        </NavLink>
      )}
    </Frame.Nav>
  )
}

export default compose(withRouter, withT)(Nav)
