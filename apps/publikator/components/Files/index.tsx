import { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Container } from '@project-r/styleguide'
import { RepoFile } from '../../lib/graphql/fragments'

import { getRepoIdFromQuery } from '../../lib/repoIdHelper'
import Nav from '../editor/Nav'
import Frame from '../Frame'

import Loader from '../Loader'

import Info from './Info'
import FilesTable from './FilesTable'
import Upload from './Upload'
import { getFileUsageInContent } from './utils/extractUrlsFromContent'
import type { RepoFile as RepoFileType } from './FilesTable'

interface Author {
  name: string
}

interface Document {
  id: string
  content: unknown
}

interface Commit {
  id: string
  document: Document
}

interface Repo {
  id: string
  files: RepoFileType[]
  latestCommit: Commit
}

interface GetFilesData {
  repo: Repo | null
}

interface GetFilesVariables {
  id: string
}

const GET_FILES = gql`
  query getFiles($id: ID!) {
    repo(id: $id) {
      id
      files {
        ...RepoFile
      }
      latestCommit {
        id
        document {
          id
          content
        }
      }
    }
  }

  ${RepoFile}
`

interface NextRouter {
  query: Record<string, string | string[] | undefined>
}

type TFunction = (key: string, options?: Record<string, unknown>) => string

interface FilesPageProps {
  router: NextRouter
  t: TFunction
}

const FilesPage: React.FC<FilesPageProps> = ({ router, t }) => {
  const repoId = getRepoIdFromQuery(router.query)
  const variables: GetFilesVariables = { id: repoId }

  const {
    data,
    loading,
    error: queryError,
  } = useQuery<GetFilesData, GetFilesVariables>(GET_FILES, { variables })

  const error =
    data?.repo === null
      ? t('repo/warn/missing', {
          repoId,
        })
      : queryError

  // Compute which files are used in the document content
  const fileUsageMap = useMemo(() => {
    const content = data?.repo?.latestCommit?.document?.content
    const files = data?.repo?.files
    if (!content || !files) return new Map()
    return getFileUsageInContent(files, content)
  }, [data?.repo?.latestCommit?.document?.content, data?.repo?.files])

  return (
    <Frame>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Nav />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw>
        <Loader
          loading={loading}
          error={error}
          render={() => (
            <Container>
              <Info />
              <Upload repoId={data!.repo!.id} />
              {!!data!.repo!.files.length && (
                <FilesTable
                  files={data!.repo!.files}
                  fileUsageMap={fileUsageMap}
                />
              )}
            </Container>
          )}
        />
      </Frame.Body>
    </Frame>
  )
}

export default FilesPage
