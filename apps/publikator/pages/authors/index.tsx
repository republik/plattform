import { useEffect, useState } from 'react'

import { Dialog, IconButton, Table, Button, Spinner } from '@radix-ui/themes'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { mockAuthors } from './mockData'
import Layout from '../../components/Layout'
import Link from 'next/link'
type Author = {
  id: string
  firstName: string
  lastName: string
  bio: string
  publicUrls: {
    website: string
    twitter: string
  }
  userId?: string
  gender: string
  prolitterisId?: string
  portraitUrl: string
  slug: string
}

const AuthorList = ({
  authors,
  onEdit,
  onDelete,
  onSave,
}: {
  authors: Author[]
  onEdit: (author: Author) => void
  onDelete: () => void
  onSave: () => void
}) => {
  return (
    <Table.Root>
      <Table.Body>
        {authors.map((author) => (
          <Table.Row align='center' key={author.id}>
            <Table.Cell>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                {author.portraitUrl && (
                  <img
                    src={author.portraitUrl}
                    alt={`${author.firstName} ${author.lastName}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                    }}
                  />
                )}
                <span style={{ fontWeight: 'bold' }}>
                  {author.firstName} {author.lastName}
                </span>
              </div>
            </Table.Cell>
            <Table.Cell>
              {author.userId && (
                <Link
                  href={`https://republik.ch/~${author.userId}`}
                  target='_blank'
                >
                  Profil
                </Link>
              )}
            </Table.Cell>
            <Table.Cell justify='end'>
              <Dialog.Root>
                <Dialog.Trigger>
                  <IconButton variant='ghost' onClick={() => onEdit(author)}>
                    <Pencil1Icon width={24} height={24} />
                  </IconButton>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Title>Autor*in editieren</Dialog.Title>
                  <Dialog.Close>
                    <Button onClick={onDelete} variant='ghost'>
                      Delete
                    </Button>
                  </Dialog.Close>
                  <Dialog.Close>
                    <Button onClick={onSave} variant='solid'>
                      Save
                    </Button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Root>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

const AuthorsPage = () => {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)
  const [editedAuthor, setEditedAuthor] = useState<Author | null>(null)

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setAuthors(mockAuthors)
      } catch (error) {
        console.error('Error loading authors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuthors()
  }, [])

  const handleEdit = (author: Author) => {
    setSelectedAuthor(author)
    setEditedAuthor({ ...author })
  }

  const handleSave = () => {
    if (editedAuthor) {
      setAuthors(
        authors.map((a) => (a.id === editedAuthor.id ? editedAuthor : a)),
      )
      setSelectedAuthor(null)
      setEditedAuthor(null)
    }
  }

  const handleDelete = () => {
    if (selectedAuthor) {
      setAuthors(authors.filter((a) => a.id !== selectedAuthor.id))
      setSelectedAuthor(null)
      setEditedAuthor(null)
    }
  }

  const handleCancel = () => {
    setSelectedAuthor(null)
    setEditedAuthor(null)
  }

  return (
    <Layout>
      <h3>Author*innen</h3>
      {loading ? (
        <Spinner loading={loading} />
      ) : (
        <AuthorList
          authors={authors}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      )}
    </Layout>
  )
}

export default AuthorsPage
