'use client'

import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Avatar,
  Table,
  Box,
  Flex,
  Text,
  Button,
  Tooltip,
  Heading,
  Spinner,
  TextField,
} from '@radix-ui/themes'
import {
  Pencil,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import TooltipIcons from '../components/author-table/tooltip-icons'

export interface Contributor {
  id: string
  name: string
  shortBio?: string
  image?: string
  employee?: string | null
  userId?: string | null
  prolitterisId?: string | null
  slug: string
}

interface ContributorsData {
  contributors: {
    totalCount: number
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor?: string
      endCursor?: string
    }
    nodes: Contributor[]
  }
}

interface ContributorsVariables {
  first: number
  after?: string
  orderBy: {
    field: string
    direction: string
  }
}

const CONTRIBUTORS_QUERY = gql`
  query Contributors(
    $first: Int
    $after: String
    $orderBy: ContributorOrderBy
  ) {
    contributors(first: $first, after: $after, orderBy: $orderBy) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        name
        shortBio
        image
        employee
        userId
        prolitterisId
        slug
      }
    }
  }
`

// Dummy data for preview
const dummyContributors: Contributor[] = [
  {
    id: '1',
    name: 'Marie Müller',
    shortBio:
      'Investigative Journalistin mit Fokus auf Klimawandel und Umweltpolitik. Schreibt seit 5 Jahren für die Republik.',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    employee: 'present',
    userId: 'user123',
    prolitterisId: 'PL456',
    slug: 'marie-mueller',
  },
  {
    id: '2',
    name: 'Thomas Weber',
    shortBio:
      'Politikwissenschaftler und Autor. Experte für europäische Politik und internationale Beziehungen.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    employee: 'past',
    userId: null,
    prolitterisId: 'PL789',
    slug: 'thomas-weber',
  },
  {
    id: '3',
    name: 'Sarah Chen',
    shortBio:
      'Tech-Journalistin und ehemalige Software-Entwicklerin. Spezialisiert auf Digitalpolitik und KI.',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    employee: null,
    userId: 'user789',
    prolitterisId: null,
    slug: 'sarah-chen',
  },
  {
    id: '4',
    name: 'Dr. Andreas Schmid',
    shortBio:
      'Wirtschaftswissenschaftler und Buchautor. Schreibt über Finanzmärkte und Wirtschaftspolitik.',
    image: null,
    employee: 'present',
    userId: 'user456',
    prolitterisId: 'PL123',
    slug: 'andreas-schmid',
  },
  {
    id: '5',
    name: 'Lisa Zimmermann',
    shortBio:
      'Fotojournalistin und Dokumentarfilmerin. Fokus auf soziale Gerechtigkeit und Menschenrechte.',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    employee: null,
    userId: null,
    prolitterisId: 'PL999',
    slug: 'lisa-zimmermann',
  },
  {
    id: '6',
    name: 'Michael Roth',
    shortBio:
      'Kulturjournalist und Kunstkritiker. Schreibt über zeitgenössische Kunst und Kulturpolitik.',
    image: null,
    employee: 'past',
    userId: 'user999',
    prolitterisId: null,
    slug: 'michael-roth',
  },
]



const AuthorsPage: React.FC = () => {
  // Use dummy data for now - uncomment the real query when backend is ready
  const useDummyData = true
  const pageSize = 10

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [cursors, setCursors] = useState<string[]>([]) // Store cursors for each page

  const { data, loading, error } = useQuery<
    ContributorsData,
    ContributorsVariables
  >(CONTRIBUTORS_QUERY, {
    variables: {
      first: pageSize,
      after: cursors[currentPage - 1] || undefined,
      orderBy: {
        field: 'name',
        direction: 'ASC',
      },
    },
    skip: useDummyData, // Skip the real query when using dummy data
    onCompleted: (data) => {
      if (data.contributors.pageInfo.endCursor) {
        setCursors((prev) => {
          const newCursors = [...prev]
          newCursors[currentPage] = data.contributors.pageInfo.endCursor!
          return newCursors
        })
      }
    },
  })

  if (loading && !useDummyData) {
    return (
      <Box p='6'>
        <Flex align='center' justify='center' style={{ minHeight: '200px' }}>
          <Spinner size='3' />
        </Flex>
      </Box>
    )
  }

  if (error && !useDummyData) {
    return (
      <Box p='6'>
        <Text color='red'>Error: {error.message}</Text>
      </Box>
    )
  }

  // Use dummy data or real data
  const contributorsList = useDummyData
    ? dummyContributors.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      )
    : data?.contributors?.nodes || []

  // Calculate pagination info
  const totalCount = useDummyData
    ? dummyContributors.length
    : data?.contributors?.totalCount || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const hasNextPage = useDummyData
    ? currentPage < totalPages
    : data?.contributors?.pageInfo?.hasNextPage || false
  const hasPreviousPage = currentPage > 1

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalCount)

  return (
    <Box p='6'>
      <Heading size='8' mb='6'>
        Autor*innen
        {useDummyData && (
          <Text as='span' size='2' color='gray' ml='2'>
            (Preview with dummy data)
          </Text>
        )}
      </Heading>

      <Flex justify='start' mb='6' gap='2'>
        <Link href="/authors/new">
          <Button
            size='2'
            variant='solid'
            style={{
              backgroundColor: 'black',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            <Plus size={16} />
            <span>Neue Autor*in</span>
          </Button>
        </Link>
        <TextField.Root
          placeholder='Autor*in suchen'
          style={{ width: '300px' }}
        >
          <TextField.Slot>
            <Search height='16' width='16' />
          </TextField.Slot>
        </TextField.Root>
      </Flex>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Bild</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Kurzbio</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Info</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify='end'>
              Bearbeiten
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {contributorsList.map((contributor) => (
            <Table.Row key={contributor.id} align='center'>
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
                <TooltipIcons contributor={contributor} />
              </Table.Cell>

              <Table.Cell justify='end'>
                <Link href={`/authors/${contributor.slug}/edit`}>
                  <Button size='2' variant='ghost'>
                    <Pencil size={16} />
                  </Button>
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {contributorsList.length === 0 && (
        <Box p='6' style={{ textAlign: 'center' }}>
          <Text>No contributors found</Text>
        </Box>
      )}

      {/* Pagination Controls */}
      <Flex
        justify='between'
        align='center'
        mt='6'
        pt='4'
        style={{ borderTop: '1px solid #E5E7EB' }}
      >
        <Text size='2' color='gray'>
          Zeige {startIndex} bis {endIndex} von {totalCount} Autor*innen
        </Text>

        <Flex align='center' gap='2'>
          <Button
            variant='outline'
            size='2'
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
          >
            <ChevronLeft size={16} />
            Zurück
          </Button>

          <Text size='2' mx='4'>
            Seite {currentPage} von {totalPages}
          </Text>

          <Button
            variant='outline'
            size='2'
            onClick={handleNextPage}
            disabled={!hasNextPage}
          >
            Weiter
            <ChevronRight size={16} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default AuthorsPage
