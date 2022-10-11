import { gql, useQuery } from '@apollo/client'
import { Container } from '@project-r/styleguide'

import { getRepoIdFromQuery } from '../../lib/repoIdHelper'
import { RepoFile } from '../../lib/graphql/fragments'

import Loader from '../Loader'
import Frame from '../Frame'
import Nav from '../Edit/Nav'
import { Table, Tr, Th } from '../Table'

import Info from './Info'
import Upload from './Upload'
import Row from './Row'

const GET_FILES = gql`
  query getFiles($id: ID!) {
    repo(id: $id) {
      id
      files {
        ...RepoFile
      }
    }
  }

  ${RepoFile}
`

const FilesPage = ({ router }) => {
  const repoId = getRepoIdFromQuery(router.query)
  const variables = { id: repoId }

  const { data, loading, error } = useQuery(GET_FILES, { variables })

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
              <Upload repoId={data.id} />
              {!!data.repo.files.length && (
                <Table>
                  <thead>
                    <Tr>
                      <Th style={{ width: '70%' }}>Datei</Th>
                      <Th style={{ width: '30%' }}></Th>
                    </Tr>
                  </thead>
                  <tbody>
                    {data.repo.files.map((file) => (
                      <Row key={file.id} file={file} />
                    ))}
                  </tbody>
                </Table>
              )}
            </Container>
          )}
        />
      </Frame.Body>
    </Frame>
  )
}

export default FilesPage
