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

const NavWithFlyer = ({
  router: { query, asPath },
  t,
  isFlyer,
  isTemplate,
  isNew,
}) => {
  const repoId = getRepoIdFromQuery(query)
  const editPath = `/repo/${repoId}/edit`
  const treePath = `/repo/${repoId}/tree`
  const currentPath = asPath.split('?')[0]
  return (
    <Frame.Nav>
      <NavLink
        href={editPath}
        active={currentPath === editPath && !query.preview}
      >
        {t(`repo/nav/${isTemplate ? 'template' : 'document'}/edit`)}
      </NavLink>
      {!!isFlyer && (
        <NavLink
          href={{ pathname: editPath, query: { preview: true } }}
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

export default compose(withRouter, withT)(NavWithFlyer)
