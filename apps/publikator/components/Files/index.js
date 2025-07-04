import { gql, useQuery } from '@apollo/client'
import { Container } from '@project-r/styleguide'
import { css } from 'glamor'
import { RepoFile } from '../../lib/graphql/fragments'

import { getRepoIdFromQuery } from '../../lib/repoIdHelper'
import Nav from '../editor/Nav'
import Frame from '../Frame'

import Loader from '../Loader'
import { Table, Th, Tr } from '../Table'

import Info from './Info'
import Row from './Row'
import Upload from './Upload'

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

const styles = {
  container: css({
    overflow: 'scroll',
  }),
}

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
              <Upload repoId={data.repo.id} />
              {!!data.repo.files.length && (
                <div {...styles.container}>
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
                </div>
              )}
            </Container>
          )}
        />
      </Frame.Body>
    </Frame>
  )
}

export default FilesPage
