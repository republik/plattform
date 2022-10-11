import { gql, useQuery } from '@apollo/client'
import { Container } from '@project-r/styleguide'

import { getRepoIdFromQuery } from '../../lib/repoIdHelper'
import { RepoFile } from '../../lib/graphql/fragments'

import Frame from '../Frame'
import Nav from '../Edit/Nav'
import { Table, Tr, Th, Td } from '../Table'

import Upload from './Upload'
import File from './File'
import Publish from './Publish'
import Details from './Details'

const GET_FILES = gql`
  query getFiles($id: ID!) {
    repo(id: $id) {
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

  const { data } = useQuery(GET_FILES, { variables })

  return (
    <Frame raw>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Nav />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw>
        <Container>
          <Upload repoId={repoId} />
          {data?.repo?.files?.length && (
            <Table>
              <thead>
                <Tr>
                  <Th style={{ width: '70%' }}>Datei</Th>
                  <Th style={{ width: '30%' }}></Th>
                </Tr>
              </thead>
              <tbody>
                {data.repo.files.map((file) => (
                  <Tr key={file.id}>
                    <Td>
                      <File file={file} />
                      <Details file={file} />
                    </Td>
                    <Td style={{ textAlign: 'right' }}>
                      <Publish file={file} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Container>
      </Frame.Body>
    </Frame>
  )
}

export default FilesPage
