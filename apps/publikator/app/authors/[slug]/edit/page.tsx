'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  TextArea,
  Select,
  Avatar,
  Separator,
  Grid,
  Spinner,
  AlertDialog,
} from '@radix-ui/themes'
import { ArrowLeft, Save, Upload, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Contributor } from '../../page'

const GET_CONTRIBUTOR_QUERY = gql`
  query GetContributor($slug: String!) {
    contributor(slug: $slug) {
      id
      slug
      name
      shortBio
      image
      employee
      userId
      prolitterisId
    }
  }
`

const UPDATE_CONTRIBUTOR_MUTATION = gql`
  mutation UpdateContributor($id: ID!, $input: ContributorInput!) {
    updateContributor(id: $id, input: $input) {
      id
      slug
      name
      shortBio
      image
      employee
      userId
      prolitterisId
    }
  }
`

const DELETE_CONTRIBUTOR_MUTATION = gql`
  mutation DeleteContributor($id: ID!) {
    deleteContributor(id: $id)
  }
`

interface ContributorInput {
  name: string
  shortBio?: string
  image?: string
  employee?: string | null
  userId?: string | null
  prolitterisId?: string | null
}

interface EditAuthorPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditAuthorPage({ params }: EditAuthorPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<ContributorInput>({
    name: '',
    shortBio: '',
    image: '',
    employee: null,
    userId: '',
    prolitterisId: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data, loading, error } = useQuery(GET_CONTRIBUTOR_QUERY, {
    variables: { slug: resolvedParams.slug },
    skip: !resolvedParams.slug,
  })

  const [updateContributor] = useMutation(UPDATE_CONTRIBUTOR_MUTATION, {
    onCompleted: () => {
      router.push('/authors')
    },
    onError: (error) => {
      console.error('Error updating contributor:', error)
    },
  })

  const [deleteContributor] = useMutation(DELETE_CONTRIBUTOR_MUTATION, {
    onCompleted: () => {
      router.push('/authors')
    },
    onError: (error) => {
      console.error('Error deleting contributor:', error)
    },
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (data?.contributor) {
      const contributor = data.contributor
      setFormData({
        name: contributor.name || '',
        shortBio: contributor.shortBio || '',
        image: contributor.image || '',
        employee: contributor.employee,
        userId: contributor.userId || '',
        prolitterisId: contributor.prolitterisId || '',
      })
      setImagePreview(contributor.image)
    }
  }, [data])

  const handleInputChange = (field: keyof ContributorInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmployeeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      employee: value === 'none' ? null : value
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData(prev => ({
          ...prev,
          image: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await updateContributor({
        variables: {
          id: data.contributor.id,
          input: {
            ...formData,
            userId: formData.userId || null,
            prolitterisId: formData.prolitterisId || null,
          }
        }
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteContributor({
        variables: { id: data.contributor.id }
      })
    } catch (error) {
      console.error('Error deleting contributor:', error)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData(prev => ({
      ...prev,
      image: ''
    }))
  }

  if (loading) {
    return (
      <Box p="6">
        <Flex align="center" justify="center" style={{ minHeight: '200px' }}>
          <Spinner size="3" />
        </Flex>
      </Box>
    )
  }

  if (error || !data?.contributor) {
    return (
      <Box p="6">
        <Text color="red">
          Fehler beim Laden der Autor*in-Daten: {error?.message || 'Nicht gefunden'}
        </Text>
      </Box>
    )
  }

  return (
    <Box p="6" maxWidth="800px" mx="auto">
      {/* Header */}
      <Flex align="center" justify="between" mb="6">
        <Flex align="center" gap="3">
          <Link href="/authors">
            <Button variant="ghost" size="2">
              <ArrowLeft size={16} />
              Zurück zur Übersicht
            </Button>
          </Link>
          <Separator orientation="vertical" size="1" />
          <Heading size="6">Autor*in bearbeiten</Heading>
        </Flex>
        <Button
          variant="outline"
          size="2"
          color="red"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 size={16} />
          Löschen
        </Button>
      </Flex>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit}>
          <Box p="6">
            <Grid columns={{ initial: '1', md: '2' }} gap="6">
              {/* Left Column - Basic Info */}
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Name *
                  </Text>
                  <TextField.Root
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Vor- und Nachname"
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Kurzbio
                  </Text>
                  <TextArea
                    value={formData.shortBio}
                    onChange={(e) => handleInputChange('shortBio', e.target.value)}
                    placeholder="Kurze Beschreibung der Person und ihres Hintergrunds..."
                    rows={4}
                    resize="vertical"
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Republik Status
                  </Text>
                  <Select.Root
                    value={formData.employee || 'none'}
                    onValueChange={handleEmployeeChange}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="none">Externe*r Autor*in</Select.Item>
                      <Select.Item value="present">Aktuelle*r Redakteur*in</Select.Item>
                      <Select.Item value="past">Ehemalige*r Redakteur*in</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>

              {/* Right Column - Image & Advanced */}
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" weight="bold" mb="2">
                    Profilbild
                  </Text>
                  <Flex direction="column" gap="3">
                    <Flex align="center" gap="3">
                      <Avatar
                        src={imagePreview || undefined}
                        fallback={formData.name?.charAt(0) || '?'}
                        size="4"
                      />
                      <Flex direction="column" gap="2">
                        <Button
                          type="button"
                          variant="outline"
                          size="1"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload size={14} />
                          Bild hochladen
                        </Button>
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="1"
                            color="red"
                            onClick={removeImage}
                          >
                            <X size={14} />
                            Entfernen
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </Flex>
                </Box>

                <Separator />

                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Verknüpfte User-ID
                  </Text>
                  <TextField.Root
                    value={formData.userId || ''}
                    onChange={(e) => handleInputChange('userId', e.target.value)}
                    placeholder="User-ID (falls vorhanden)"
                  />
                  <Text size="1" color="gray" mt="1">
                    ID des verknüpften Verlegerkontos
                  </Text>
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Prolitteris-ID
                  </Text>
                  <TextField.Root
                    value={formData.prolitterisId || ''}
                    onChange={(e) => handleInputChange('prolitterisId', e.target.value)}
                    placeholder="PL-ID (falls vorhanden)"
                  />
                  <Text size="1" color="gray" mt="1">
                    ID für die Honorarabrechnung
                  </Text>
                </Box>
              </Flex>
            </Grid>

            {/* Form Actions */}
            <Flex justify="end" gap="3" mt="6" pt="4" style={{ borderTop: '1px solid var(--gray-6)' }}>
              <Link href="/authors">
                <Button variant="outline" size="2">
                  Abbrechen
                </Button>
              </Link>
              <Button
                type="submit"
                size="2"
                disabled={!formData.name || isSubmitting}
                loading={isSubmitting}
              >
                <Save size={16} />
                Änderungen speichern
              </Button>
            </Flex>
          </Box>
        </form>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialog.Content>
          <AlertDialog.Title>Autor*in löschen</AlertDialog.Title>
          <AlertDialog.Description>
            Möchten Sie <strong>{data.contributor.name}</strong> wirklich löschen? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialog.Description>
          <Flex justify="end" gap="3" mt="4">
            <AlertDialog.Cancel>
              <Button variant="outline" size="2">
                Abbrechen
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" size="2" color="red" onClick={handleDelete}>
                Löschen
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  )
} 