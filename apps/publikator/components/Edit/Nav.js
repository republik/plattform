import { withRouter } from 'next/router'
import { getRepoIdFromQuery } from '../../lib/repoIdHelper'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'
import Link from 'next/link'
import { TabNav, Text } from '@radix-ui/themes'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'space',
    justifyContent: 'space-between',
    gap: 16,
  }),
  title: css({
    flex: '0 1 300px',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  link: css({
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'none',
    },
  }),
}

const Nav = ({ router: { query, asPath }, t, isTemplate, isNew, data }) => {
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
    <div {...styles.container}>
      {title && (
        <div {...styles.title}>
          <Text>{title}</Text>
        </div>
      )}
      <TabNav.Root>
        <TabNav.Link active={currentPath === editPath && !query.preview}>
          <Link href={{ pathname: editPath, query: editQuery }} replace>
            <span {...styles.link}>
              {t(`repo/nav/${isTemplate ? 'template' : 'document'}/edit`)}
            </span>
          </Link>
        </TabNav.Link>
        {!isNew && (
          <TabNav.Link active={currentPath === editPath && query.preview}>
            <Link href={previewPath} replace>
              <span {...styles.link}>Vorschau</span>
            </Link>
          </TabNav.Link>
        )}
        {!isNew && (
          <TabNav.Link active={currentPath === treePath}>
            <Link href={treePath} replace>
              <span {...styles.link}>Versionen</span>
            </Link>
          </TabNav.Link>
        )}
        {!isNew && (
          <TabNav.Link active={currentPath === filesPath}>
            <Link href={filesPath} replace>
              <span {...styles.link}>Dateien</span>
            </Link>
          </TabNav.Link>
        )}
      </TabNav.Root>
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
