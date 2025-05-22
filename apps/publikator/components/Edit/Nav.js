import { withRouter } from 'next/router'
import { getRepoIdFromQuery } from '../../lib/repoIdHelper'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'
import Link from 'next/link'
import { Text } from '@radix-ui/themes'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'

const styles = {
  container: css({
    position: 'fixed',
    top: 0,
    left: 180,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    height: '60px',
    padding: '0 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e0e0e0',
    zIndex: 100,
    transition: 'left 0.3s ease',
    '@media only screen and (max-width: 480px)': {
      left: 0,
    },
  }),
  containerCollapsed: css({
    left: 60,
  }),
  link: css({
    textDecoration: 'none',
    color: 'black',
    padding: '8px 16px',
    '&:hover': {
      textDecoration: 'none',
      color: 'black',
    },
  }),
  activeLink: css({
    fontWeight: 'bold',
  }),
  nav: css({
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  }),
}

const Nav = ({
  router: { query, asPath },
  t,
  isTemplate,
  isNew,
  data,
  children,
  isSidebarOpen,
}) => {
  const repoId = getRepoIdFromQuery(query)
  const editPath = `/repo/${repoId}/edit`
  const treePath = `/repo/${repoId}/tree`
  const filesPath = `/repo/${repoId}/files`
  const currentPath = asPath.split('?')[0]
  const editQuery =
    currentPath === editPath && query.commitId
      ? { commitId: query.commitId }
      : undefined

  const previewPath = {
    pathname: editPath,
    query: { ...editQuery, preview: true },
  }

  const title = data?.repo?.latestCommit?.document?.meta?.title

  return (
    <div
      {...styles.container}
      {...(!isSidebarOpen && styles.containerCollapsed)}
    >
      <div {...styles.nav}>
        {title && (
          <Text>
            <i>{title}</i>
          </Text>
        )}
        <Link
          href={{ pathname: editPath, query: editQuery }}
          replace
          {...styles.link}
          {...(currentPath === editPath && !query.preview
            ? styles.activeLink
            : {})}
        >
          {t(`repo/nav/${isTemplate ? 'template' : 'document'}/edit`)}
        </Link>
        {!isNew && (
          <Link
            href={previewPath}
            replace
            {...styles.link}
            {...(currentPath === editPath && query.preview
              ? styles.activeLink
              : {})}
          >
            Vorschau
          </Link>
        )}
        {!isNew && (
          <Link
            href={treePath}
            replace
            {...styles.link}
            {...(currentPath === treePath ? styles.activeLink : {})}
          >
            Versionen
          </Link>
        )}
        {!isNew && (
          <Link
            href={filesPath}
            replace
            {...styles.link}
            {...(currentPath === filesPath ? styles.activeLink : {})}
          >
            Dateien
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

const query = gql`
  query getRepoTitle($repoId: ID!) {
    repo(id: $repoId) {
      id
      latestCommit {
        document {
          meta {
            title
          }
        }
      }
    }
  }
`

export default compose(
  withRouter,
  withT,
  graphql(query, {
    options: ({ router: { query } }) => ({
      variables: {
        repoId: getRepoIdFromQuery(query),
      },
    }),
  }),
)(Nav)
