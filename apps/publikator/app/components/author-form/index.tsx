'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
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
} from '@radix-ui/themes'
import { ArrowLeft, Save, Upload, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import GeneralWarningErrorCallout from './warning-error-callout'
import {
  ArticleContributor,
  UpsertContributorError,
  MutationsUpsertContributorArgs,
  GenderEnum,
} from '../../../graphql/republik-api/__generated__/gql/graphql'

export interface FormState {
  success: boolean
  errors: UpsertContributorError[]
  warnings: string[]
  data?: ArticleContributor
}

interface AuthorFormProps {
  initialData?: ArticleContributor
  isEdit?: boolean
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  onDelete?: () => void
  title: string
}

export default function AuthorForm({
  initialData,
  isEdit = false,
  action,
  onDelete,
  title,
}: AuthorFormProps) {
  const [formData, setFormData] = useState<MutationsUpsertContributorArgs>({
    name: '',
    shortBio: '',
    image: '',
    bio: '',
    userId: '',
    prolitterisId: '',
    gender: GenderEnum.Na,
    prolitterisFirstname: '',
    prolitterisLastname: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Use React 19's useActionState hook
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    errors: [],
    warnings: [],
  })

  // Split errors into field-specific and general errors
  const fieldErrors = state.errors.filter((error) => error.field !== null)
  const generalErrors = state.errors.filter((error) => error.field === null)

  // Helper function to get error for a specific field
  const getFieldError = (fieldName: string): string | null => {
    const error = fieldErrors.find((error) => error.field === fieldName)
    return error ? error.message : null
  }

  // Helper function to check if field has error
  const hasFieldError = (fieldName: string): boolean => {
    return fieldErrors.some((error) => error.field === fieldName)
  }

  // Populate form when initialData is provided
  useEffect(() => {
    console.log('useEffect running with initialData:', initialData)
    if (initialData) {
      console.log('Setting formData with gender:', initialData.gender)
      setFormData({
        name: initialData.name || '',
        shortBio: initialData.shortBio || '',
        image: initialData.image || '',
        bio: initialData.bio || '',
        userId: initialData.userId || '',
        prolitterisId: initialData.prolitterisId || '',
        gender: initialData.gender,
        prolitterisFirstname: initialData.prolitterisFirstname,
        prolitterisLastname: initialData.prolitterisLastname,
      })
      setImagePreview(initialData.image)
    }
  }, [initialData])

  const handleInputChange = (
    field: keyof MutationsUpsertContributorArgs,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

      <GeneralWarningErrorCallout
        generalErrors={generalErrors}
        warnings={state.warnings}
      />

      {/* Form */}
      <Card>
        <form action={formAction}>
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
                  <input type='hidden' name='image' value={formData.image} />
                  {getFieldError('image') && (
                    <Text size='1' color='red'>
                      {getFieldError('image')}
                    </Text>
                  )}
                </Flex>
              </Box>

              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Name *
                </Text>
                <TextField.Root
                  name='name'
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder='Vor- und Nachname'
                  required
                  color={hasFieldError('name') ? 'red' : undefined}
                />
                {getFieldError('name') && (
                  <Text size='1' color='red' mt='1'>
                    {getFieldError('name')}
                  </Text>
                )}
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
                  name='shortBio'
                  value={formData.shortBio}
                  onChange={(e) =>
                    handleInputChange('shortBio', e.target.value)
                  }
                  placeholder='Maximal 500 Zeichen'
                  rows={4}
                  resize='vertical'
                  color={hasFieldError('shortBio') ? 'red' : undefined}
                />
                {getFieldError('shortBio') && (
                  <Text size='1' color='red' mt='1'>
                    {getFieldError('shortBio')}
                  </Text>
                )}
              </Box>

              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Verknüpfte User-ID
                </Text>
                <TextField.Root
                  name='userId'
                  value={formData.userId || ''}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  placeholder='User-ID (falls vorhanden)'
                  color={hasFieldError('userId') ? 'red' : undefined}
                />
                <Text size='1' color='gray' mt='1'>
                  ID des verknüpften Verlegerkontos
                </Text>
                {getFieldError('userId') && (
                  <Text size='1' color='red' mt='1'>
                    {getFieldError('userId')}
                  </Text>
                )}
              </Box>

              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Prolitteris-ID
                </Text>
                <TextField.Root
                  name='prolitterisId'
                  value={formData.prolitterisId}
                  onChange={(e) =>
                    handleInputChange('prolitterisId', e.target.value)
                  }
                  placeholder='PL-ID (falls vorhanden)'
                  color={hasFieldError('prolitterisId') ? 'red' : undefined}
                />
                <Text size='1' color='gray' mt='1'>
                  ID für die Honorarabrechnung
                </Text>
                {getFieldError('prolitterisId') && (
                  <Text size='1' color='red' mt='1'>
                    {getFieldError('prolitterisId')}
                  </Text>
                )}
              </Box>

              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Prolitteris Vorname
                </Text>
                <TextField.Root
                  name='prolitterisFirstname'
                  value={formData.prolitterisFirstname || ''}
                  onChange={(e) =>
                    handleInputChange('prolitterisFirstname', e.target.value)
                  }
                  placeholder='Vorname (falls vorhanden)'
                />
              </Box>

              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Prolitteris Nachname
                </Text>
                <TextField.Root
                  name='prolitterisLastname'
                  value={formData.prolitterisLastname || ''}
                  onChange={(e) =>
                    handleInputChange('prolitterisLastname', e.target.value)
                  }
                  placeholder='Nachname (falls vorhanden)'
                />
              </Box>

              <Box>
                <Flex align='center' justify='start' mb='1' gap='8'>
                  <Box>
                    <Text as='p' size='2' weight='bold' mb='1'>
                      Gender
                    </Text>
                    <Select.Root
                      name='gender'
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange('gender', value)
                      }
                    >
                      <Select.Trigger
                        color={hasFieldError('gender') ? 'red' : undefined}
                      />
                      <Select.Content>
                        <Select.Item value='na'>Keine Angabe</Select.Item>
                        <Select.Item value='m'>Männlich</Select.Item>
                        <Select.Item value='f'>Weiblich</Select.Item>
                        <Select.Item value='d'>Divers</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <input
                      type='hidden'
                      name='gender'
                      value={formData.gender || 'na'}
                    />
                    {getFieldError('gender') && (
                      <Text size='1' color='red' mt='1'>
                        {getFieldError('gender')}
                      </Text>
                    )}
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
                disabled={!formData.name || isPending}
                loading={isPending}
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
