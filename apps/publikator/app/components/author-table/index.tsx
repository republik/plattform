import { Avatar, Table, Text } from '@radix-ui/themes'
import { useRouter } from 'next/navigation'
import TooltipIcons from './tooltip-icons'
import { ArticleContributor } from '../../../graphql/republik-api/__generated__/gql/graphql'

interface AuthorTableProps {
  contributorsList: Pick<
    ArticleContributor,
    | 'id'
    | 'name'
    | 'slug'
    | 'shortBio'
    | 'image'
    | 'prolitterisId'
    | 'userId'
    | 'updatedAt'
  >[]
}

const AuthorTable = ({ contributorsList }: AuthorTableProps) => {
  const router = useRouter()

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Bild</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Kurzbio</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Info</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell justify='end'>
            Aktualisiert
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {contributorsList.map((contributor) => (
          <Table.Row
            key={contributor.id}
            align='center'
            style={{
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            onClick={() => router.push(`/authors/${contributor.slug}`)}
          >
            <Table.Cell justify='start'>
              <Avatar
                src={contributor.image || undefined}
                fallback={contributor.name?.charAt(0) || '?'}
                size='2'
              />
            </Table.Cell>

            <Table.Cell justify='start'>
              <Text weight='medium'>{contributor.name}</Text>
            </Table.Cell>

            <Table.Cell justify='start'>
              <Text
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '400px',
                }}
              >
                {contributor.shortBio || '—'}
              </Text>
            </Table.Cell>

            <Table.Cell justify='center'>
              <TooltipIcons
                prolitterisId={contributor.prolitterisId}
                userId={contributor.userId}
              />
            </Table.Cell>

            <Table.Cell justify='end'>
              <Text size='1' color='gray' style={{ textAlign: 'right' }}>
                {new Date(contributor.updatedAt).toLocaleDateString()}
              </Text>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default AuthorTable
