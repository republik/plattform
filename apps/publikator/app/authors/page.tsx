'use client'

import { useQuery } from '@apollo/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Spinner,
  TextField,
} from '@radix-ui/themes'
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  ContributorsDocument,
  ContributorsQuery,
  ContributorsQueryVariables,
  OrderDirection,
  ContributorOrderField,
} from '../../graphql/republik-api/__generated__/gql/graphql'
import AuthorTable from '../components/author-table'

const AuthorsPage: React.FC = () => {
  const pageSize = 15

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [cursors, setCursors] = useState<string[]>([]) // Store cursors for each page

  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1)
    setCursors([])
  }, [debouncedSearchTerm])

  const { data, loading, error, previousData } = useQuery<
    ContributorsQuery,
    ContributorsQueryVariables
  >(ContributorsDocument, {
    variables: {
      first: pageSize,
      after: cursors[currentPage - 1] || undefined,
      orderBy: {
        field: ContributorOrderField.UpdatedAt,
        direction: OrderDirection.Desc,
      },
      filters: debouncedSearchTerm
        ? { search: debouncedSearchTerm }
        : undefined,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
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

  // Show full loading only on initial load (when there's no previous data)
  if (loading && !data && !previousData) {
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

  // Use current data if available, otherwise fall back to previous data
  const currentData = data || previousData
  const contributorsList = currentData?.contributors?.nodes || []

  // Calculate pagination info from current data
  const totalCount = currentData?.contributors?.totalCount || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const hasNextPage = currentData?.contributors?.pageInfo?.hasNextPage || false
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        >
          <TextField.Slot>
            <Search height='16' width='16' />
          </TextField.Slot>
          {searchTerm && (
            <TextField.Slot side='right'>
              <Button
                variant='ghost'
                size='1'
                onClick={() => setSearchTerm('')}
                style={{ padding: '4px', marginRight: 0 }}
              >
                <X height='16' width='16' />
              </Button>
            </TextField.Slot>
          )}
        </TextField.Root>
      </Flex>

      <AuthorTable contributorsList={contributorsList} />

      {contributorsList.length === 0 && !loading && (
        <Flex p='6' justify='center' align='center' direction='column'>
          <Text>
            {debouncedSearchTerm
              ? `Keine Autor*innen gefunden für "${debouncedSearchTerm}"`
              : 'Keine Autor*innen gefunden'}
          </Text>
          {debouncedSearchTerm && (
            <Button
              variant='ghost'
              size='2'
              mt='2'
              onClick={() => setSearchTerm('')}
            >
              Suche zurücksetzen
            </Button>
          )}
        </Flex>
      )}

      {/* Pagination Controls */}
      <Flex justify='between' align='center' mt='4' pt='4'>
        <Text size='2' color='gray'>
          {debouncedSearchTerm ? (
            <>
              Zeige {startIndex} bis {endIndex} von {totalCount} Suchergebnissen
              für &quot;{debouncedSearchTerm}&quot;
            </>
          ) : (
            <>
              Zeige {startIndex} bis {endIndex} von {totalCount} Autor*innen
            </>
          )}
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
