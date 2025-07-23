'use client'

import { useQuery } from '@apollo/client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Avatar,
  Table,
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Spinner,
  TextField,
} from '@radix-ui/themes'
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import TooltipIcons from '../components/ui/tooltip-icons'
import {
  ContributorsDocument,
  ContributorsQuery,
  ContributorsQueryVariables,
  OrderDirection,
  ContributorOrderField,
} from '../../graphql/republik-api/__generated__/gql/graphql'

const AuthorsPage: React.FC = () => {
  const pageSize = 10
  const router = useRouter()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [cursors, setCursors] = useState<string[]>([]) // Store cursors for each page

  const { data, loading, error } = useQuery<
    ContributorsQuery,
    ContributorsQueryVariables
  >(ContributorsDocument, {
    variables: {
      first: pageSize,
      after: cursors[currentPage - 1] || undefined, 
      orderBy: {
        field: ContributorOrderField.UpdatedAt,
        direction: OrderDirection.Asc,
      },
    },
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

  if (loading) {
    return (
      <Box p='6'>
        <Flex align='center' justify='center' style={{ minHeight: '200px' }}>
          <Spinner size='3' />
        </Flex>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p='6'>
        <Text color='red'>Error: {error.message}</Text>
      </Box>
    )
  }

  const contributorsList = data?.contributors?.nodes || []

  // Calculate pagination info
  const totalCount = data?.contributors?.totalCount || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const hasNextPage = data?.contributors?.pageInfo?.hasNextPage || false
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
      </Heading>

      <Flex justify='start' mb='6' gap='2'>
        <Link href='/authors/new'>
          <Button
            size='2'
            variant='solid'
            style={{
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
            <Table.ColumnHeaderCell>Aktualisiert</Table.ColumnHeaderCell>
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
                <TooltipIcons contributor={contributor} />
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
