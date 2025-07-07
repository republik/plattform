'use client'

import { useState, useEffect } from 'react'
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
  AlertDialog,
  Callout,
} from '@radix-ui/themes'
import { ArrowLeft, Save, Upload, X, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export interface ContributorInput {
  name: string
  shortBio?: string
  image?: string
  employee?: string | null
  userId?: string | null
  prolitterisId?: string | null
  gender?: string | null
}

export interface ContributorData extends ContributorInput {
  id?: string
  slug?: string
}

interface AuthorFormProps {
  initialData?: ContributorData
  isEdit?: boolean
  isSubmitting?: boolean
  onSubmit: (data: ContributorInput) => void
  onDelete?: () => void
  title: string
  errors?: string[]
  warnings?: string[]
  onClearErrors?: () => void
  onClearWarnings?: () => void
}

export default function AuthorForm({
  initialData,
  isEdit = false,
  isSubmitting = false,
  onSubmit,
  onDelete,
  title,
  errors = [],
  warnings = [],
  onClearErrors,
  onClearWarnings,
}: AuthorFormProps) {
  const [formData, setFormData] = useState<ContributorInput>({
    name: '',
    shortBio: '',
    image: '',
    employee: null,
    userId: '',
    prolitterisId: '',
    gender: null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Populate form when initialData is provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        shortBio: initialData.shortBio || '',
        image: initialData.image || '',
        employee: initialData.employee,
        userId: initialData.userId || '',
        prolitterisId: initialData.prolitterisId || '',
        gender: initialData.gender,
      })
      setImagePreview(initialData.image)
    }
  }, [initialData])

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

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value === 'none' ? null : value,
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
    // Clear previous errors/warnings when submitting
    if (onClearErrors) onClearErrors()
    if (onClearWarnings) onClearWarnings()
    onSubmit(formData)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
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
          <Heading size='6'>{title}</Heading>
        </Flex>
        {isEdit && onDelete && (
          <Button
            variant='outline'
            size='2'
            color='red'
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={16} />
            Löschen
          </Button>
        )}
      </Flex>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Box mb='4'>
          <Callout.Root color='red' mb='2'>
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>
              {errors.length === 1 ? (
                errors[0]
              ) : (
                <Box>
                  <Text weight='bold' mb='1'>
                    Es sind Fehler aufgetreten:
                  </Text>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}

      {/* Warning Messages */}
      {warnings.length > 0 && (
        <Box mb='4'>
          <Callout.Root color='yellow' mb='2'>
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>
              {warnings.length === 1 ? (
                warnings[0]
              ) : (
                <Box>
                  <Text weight='bold' mb='1'>
                    Warnungen:
                  </Text>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit}>
          <Box p='6'>
            <Flex direction='column' gap='4'>
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
                        variant='soft'
                        size='1'
                        onClick={() =>
                          document.getElementById('image-upload')?.click()
                        }
                      >
                        <Upload size={14} />
                        {imagePreview ? 'Bild ersetzen' : 'Bild hochladen'}
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
              <Box>
                <Flex align='center' justify='start' mb='1' gap='8'>
                  <Box>
                    <Text as='p' size='2' weight='bold' mb='1'>
                      Geschlecht
                    </Text>
                    <Select.Root
                      value={formData.gender || 'none'}
                      onValueChange={handleGenderChange}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value='none'>Keine Angabe</Select.Item>
                        <Select.Item value='m'>Männlich</Select.Item>
                        <Select.Item value='f'>Weiblich</Select.Item>
                        <Select.Item value='d'>Divers</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box>
                    <Text
                      as='p'
                      size='2'
                      weight='bold'
                      mb='1'
                      style={{ width: '100%' }}
                    >
                      Teammitglied
                    </Text>
                    <Select.Root
                      value={formData.employee || 'none'}
                      onValueChange={handleEmployeeChange}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value='none'>Extern</Select.Item>
                        <Select.Item value='present'>Aktuell</Select.Item>
                        <Select.Item value='past'>Ehemalig</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>
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
                {isEdit ? 'Änderungen speichern' : 'Autor*in erstellen'}
              </Button>
            </Flex>
          </Box>
        </form>
      </Card>

      {/* Delete Confirmation Dialog */}
      {isEdit && onDelete && (
        <AlertDialog.Root
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        >
          <AlertDialog.Content>
            <AlertDialog.Title>Autor*in löschen</AlertDialog.Title>
            <AlertDialog.Description>
              Möchten Sie <strong>{formData.name}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialog.Description>
            <Flex justify='end' gap='3' mt='4'>
              <AlertDialog.Cancel>
                <Button variant='outline' size='2'>
                  Abbrechen
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  variant='solid'
                  size='2'
                  color='red'
                  onClick={handleDelete}
                >
                  Löschen
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      )}
    </Box>
  )
}
