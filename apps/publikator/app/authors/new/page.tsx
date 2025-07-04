'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
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
} from '@radix-ui/themes'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'

const CREATE_CONTRIBUTOR_MUTATION = gql`
  mutation CreateContributor($input: ContributorInput!) {
    upsertContributor(input: $input) {
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

interface ContributorInput {
  name: string
  shortBio?: string
  image?: string
  employee?: string | null
  userId?: string | null
  prolitterisId?: string | null
}

export default function NewAuthorPage() {
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

  const [createContributor] = useMutation(CREATE_CONTRIBUTOR_MUTATION, {
    onCompleted: (data) => {
      router.push(`/authors/${data.createContributor.slug}/edit`)
    },
    onError: (error) => {
      console.error('Error creating contributor:', error)
    },
  })

  const handleInputChange = (field: keyof ContributorInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEmployeeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      employee: value === 'none' ? null : value,
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData((prev) => ({
          ...prev,
          image: result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createContributor({
        variables: {
          input: {
            ...formData,
            userId: formData.userId || null,
            prolitterisId: formData.prolitterisId || null,
          },
        },
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData((prev) => ({
      ...prev,
      image: '',
    }))
  }

  return (
    <Box p='6' maxWidth='800px' mx='auto'>
      {/* Header */}
      <Flex align='center' justify='between' mb='6'>
        <Flex align='center' gap='3'>
          <Link href='/authors'>
            <Button variant='ghost' size='2'>
              <ArrowLeft size={16} />
              Zurück zur Übersicht
            </Button>
          </Link>
          <Separator orientation='vertical' size='1' />
          <Heading size='6'>Neue Autor*in erstellen</Heading>
        </Flex>
      </Flex>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit}>
          <Box p='6'>
            <Flex direction='column' gap='4'>
              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Name *
                </Text>
                <TextField.Root
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder='Vor- und Nachname'
                  required
                />
              </Box>

              <Box>
                <Flex align='center' justify='between' mb='1'>
                  <Text as='label' size='2' weight='bold'>
                    Kurzbio
                  </Text>
                  <Text size='1' color='gray'>
                    {formData.shortBio?.length || 0}/500
                  </Text>
                </Flex>
                <TextArea
                  value={formData.shortBio}
                  onChange={(e) =>
                    handleInputChange('shortBio', e.target.value)
                  }
                  placeholder='Maximal 500 Zeichen'
                  rows={4}
                  resize='vertical'
                />
              </Box>
              <Box>
                <Text as='label' size='2' weight='bold' mb='2'>
                  Profilbild
                </Text>
                <Flex direction='column' gap='3'>
                  <Flex align='center' gap='3'>
                    <Avatar
                      src={imagePreview || undefined}
                      fallback={formData.name?.charAt(0) || '?'}
                      size='8'
                    />
                    <Flex direction='column' gap='2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='1'
                        onClick={() =>
                          document.getElementById('image-upload')?.click()
                        }
                      >
                        <Upload size={14} />
                        Bild hochladen
                      </Button>
                      {imagePreview && (
                        <Button
                          type='button'
                          variant='outline'
                          size='1'
                          color='red'
                          onClick={removeImage}
                        >
                          <X size={14} />
                          Entfernen
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                  <input
                    id='image-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </Flex>
              </Box>
              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Verknüpfte User-ID
                </Text>
                <TextField.Root
                  value={formData.userId || ''}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  placeholder='User-ID (falls vorhanden)'
                />
                <Text size='1' color='gray' mt='1'>
                  ID des verknüpften Verlegerkontos
                </Text>
              </Box>

              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Mitarbeitende
                </Text>
                <Select.Root
                  value={formData.employee || 'none'}
                  onValueChange={handleEmployeeChange}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value='none'>Externe</Select.Item>
                    <Select.Item value='present'>
                      Aktuelle Mitarbeiter*in
                    </Select.Item>
                    <Select.Item value='past'>
                      Ehemalige Mitarbeiter*in
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Prolitteris-ID
                </Text>
                <TextField.Root
                  value={formData.prolitterisId || ''}
                  onChange={(e) =>
                    handleInputChange('prolitterisId', e.target.value)
                  }
                  placeholder='PL-ID (falls vorhanden)'
                />
                <Text size='1' color='gray' mt='1'>
                  ID für die Honorarabrechnung
                </Text>
              </Box>
            </Flex>

            {/* Form Actions */}
            <Flex
              justify='end'
              gap='3'
              mt='6'
              pt='4'
              style={{ borderTop: '1px solid var(--gray-6)' }}
            >
              <Link href='/authors'>
                <Button variant='outline' size='2'>
                  Abbrechen
                </Button>
              </Link>
              <Button
                type='submit'
                size='2'
                disabled={!formData.name || isSubmitting}
                loading={isSubmitting}
              >
                <Save size={16} />
                Autor*in erstellen
              </Button>
            </Flex>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
