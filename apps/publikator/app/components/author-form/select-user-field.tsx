'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  TextField,
  Text,
  Box,
  Avatar,
  Flex,
  Button,
  Badge,
} from '@radix-ui/themes'
import { Search, User, X } from 'lucide-react'
import { searchUsers } from '../../authors/(actions)/searchUsers'
import { debounce } from 'lodash'

interface User {
  id: string
  name?: string
  slug?: string
  portrait?: string
  email?: string
}

interface SelectUserFieldProps {
  formState: any
  hasFieldError: (fieldName: string) => boolean
  onUserSelect?: (userId: string, user: User) => void
  initialValue?: string
}

const SelectUserField = ({
  formState,
  hasFieldError,
  onUserSelect,
  initialValue,
}: SelectUserFieldProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [hasBeenCleared, setHasBeenCleared] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const existingUserId = initialValue || formState.data?.userId
    if (existingUserId && !selectedUser && !hasBeenCleared) {
      setSelectedUser({
        id: existingUserId,
        name: undefined,
        email: undefined,
      })
    }
  }, [initialValue, formState.data?.userId])

  const debouncedSearch = useCallback(
    debounce(async (searchString: string) => {
      if (searchString.length >= 3) {
        setIsLoading(true)
        try {
          const searchResults = await searchUsers(searchString)
          setUsers(searchResults || [])
          setIsPopoverOpen(true)
        } catch (error) {
          console.error('Error searching users:', error)
          setUsers([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setUsers([])
        setIsPopoverOpen(false)
      }
    }, 300),
    [],
  )

  const handleInputChange = (value: string) => {
    setSearchValue(value)
    debouncedSearch(value)

    if (!value) {
      setSelectedUser(null)
      onUserSelect?.('', null as any)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setSearchValue('')
    setIsPopoverOpen(false)
    setHasBeenCleared(false)
    onUserSelect?.(user.id, user)
  }

  const handleClearSelection = () => {
    setSelectedUser(null)
    setSearchValue('')
    setHasBeenCleared(true)
    onUserSelect?.('', null as any)
  }

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false)
      }
    }

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isPopoverOpen])

  return (
    <Box ref={containerRef} style={{ position: 'relative' }}>
      {selectedUser ? (
        <Box
          style={{
            border: hasFieldError('userId')
              ? '1px solid var(--red-8)'
              : '1px solid var(--gray-6)',
            borderRadius: 'var(--radius-2)',
            padding: '8px 12px',
            backgroundColor: 'var(--gray-1)',
          }}
        >
          <Flex align='center' justify='between'>
            <Flex align='center' gap='2'>
              <Box>
                <Text size='2' weight='medium'>
                  {selectedUser.name || selectedUser.id}
                </Text>
              </Box>
            </Flex>
            <Button
              size='1'
              variant='ghost'
              onClick={handleClearSelection}
              style={{ padding: '4px' }}
            >
              <X size={14} />
            </Button>
          </Flex>
        </Box>
      ) : (
        <TextField.Root
          value={searchValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder='User suchen'
          color={hasFieldError('userId') ? 'red' : undefined}
          onFocus={() => {
            if (users.length > 0) {
              setIsPopoverOpen(true)
            }
          }}
        >
          <TextField.Slot>
            <Search size={16} />
          </TextField.Slot>
        </TextField.Root>
      )}

      <input
        type='hidden'
        name='userId'
        value={selectedUser?.id || formState.data?.userId || ''}
      />

      {!selectedUser && isPopoverOpen && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid var(--gray-6)',
            borderRadius: 'var(--radius-2)',
            boxShadow: 'var(--shadow-4)',
            zIndex: 50,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {isLoading ? (
            <Box p='3'>
              <Text size='2'>Suchen...</Text>
            </Box>
          ) : users.length > 0 ? (
            <Box p='2'>
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant='ghost'
                  onClick={() => handleUserSelect(user)}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    height: 'auto',
                    padding: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <Flex align='center' gap='3'>
                    <Avatar
                      size='2'
                      src={user.portrait || undefined}
                      fallback={<User size={16} />}
                    />
                    <Box>
                      <Text size='2' weight='medium' mr='2'>
                        {user.name || user.id}
                      </Text>
                      <Text size='1' color='gray'>
                        {user.email}
                      </Text>
                    </Box>
                  </Flex>
                </Button>
              ))}
            </Box>
          ) : searchValue.length === 0 ? (
            <Box p='3'>
              <Text size='2' color='gray'>
                Keine Benutzer gefunden
              </Text>
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  )
}

export default SelectUserField
