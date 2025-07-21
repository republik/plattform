'use client'

import { useState } from 'react'
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
  Separator,
} from '@radix-ui/themes'
import { ArrowLeft, Search, Save } from 'lucide-react'
import Link from 'next/link'
import GeneralWarningErrorCallout from './warning-error-callout'
import { ArticleContributor } from '../../../graphql/republik-api/__generated__/gql/graphql'
import { upsertAuthor } from '../../authors/actions'
import DeleteAuthorButton from './delete-author-button'
import ProfileImageUpload from './profile-image-upload'
import ProlitterisFields from './prolitteris-fields'

interface AuthorFormProps {
  initialData?: ArticleContributor
  isEdit?: boolean
  title: string
}

export default function AuthorForm({
  initialData,
  isEdit = false,
  title,
}: AuthorFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image || null,
  )
  
  const [prolitterisValidationError, setProlitterisValidationError] = useState<string | null>(null)

  const [formState, formAction, isPending] = useActionState(upsertAuthor, {
    success: false,
    errors: [],
    warnings: [],
    data: initialData,
  })

  // Split errors into field-specific and general errors
  const fieldErrors = formState.errors.filter((error) => error.field !== null)
  const generalErrors = formState.errors.filter((error) => error.field === null)

  // Helper function to get error for a specific field
  const getFieldError = (fieldName: string): string | null => {
    const error = fieldErrors.find((error) => error.field === fieldName)
    return error ? error.message : null
  }

  // Helper function to check if field has error
  const hasFieldError = (fieldName: string): boolean => {
    return fieldErrors.some((error) => error.field === fieldName)
  }

  const handleImageChange = (url: string | null) => {
    setImageUrl(url)
  }

  const handleProlitterisValidationChange = (isValid: boolean, errorMessage: string | null) => {
    setProlitterisValidationError(errorMessage)
  }

  const handleFormSubmit = (formData: FormData) => {
    if (prolitterisValidationError) {
      return
    }
    formAction(formData)
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
          <Heading size='3'>{title}</Heading>
        </Flex>
        {isEdit && (
          <DeleteAuthorButton
            name={formState.data?.name || ''}
            id={formState.data?.id || ''}
          />
        )}
      </Flex>

      <GeneralWarningErrorCallout
        generalErrors={generalErrors}
        warnings={formState.warnings}
      />

      {/* Form */}
      <Card>
        <form action={handleFormSubmit}>
          <input type='hidden' name='id' defaultValue={formState.data?.id} />
          <Box p='6'>
            <Flex direction='column' gap='5'>
              <ProfileImageUpload
                currentImageUrl={imageUrl}
                fallback={formState.data?.name?.charAt(0) || '?'}
                onImageChange={handleImageChange}
                error={getFieldError('image')}
              />
              <input
                type='hidden'
                name='image'
                value={imageUrl || ''}
              />

              <Box>
                <Text as='label' size='2' weight='bold' mb='1'>
                  Name *
                </Text>
                <TextField.Root
                  name='name'
                  defaultValue={formState.data?.name}
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
                </Flex>
                <TextArea
                  name='shortBio'
                  defaultValue={formState.data?.shortBio}
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
                  defaultValue={formState.data?.userId}
                  placeholder='User-ID suchen'
                  color={hasFieldError('userId') ? 'red' : undefined}
                >
                  <TextField.Slot>
                    <Search size={16} />
                  </TextField.Slot>
                </TextField.Root>
                <Text size='1' color='gray' mt='1'>
                  ID des verknüpften Verlegerkontos (falls vorhanden)
                </Text>
                {getFieldError('userId') && (
                  <Text size='1' color='red' mt='1'>
                    {getFieldError('userId')}
                  </Text>
                )}
              </Box>

              <ProlitterisFields
                initialValues={{
                  prolitterisId: formState.data?.prolitterisId,
                  prolitterisFirstname: formState.data?.prolitterisFirstname,
                  prolitterisLastname: formState.data?.prolitterisLastname,
                }}
                getFieldError={getFieldError}
                hasFieldError={hasFieldError}
                onValidationChange={handleProlitterisValidationChange}
              />

              <Box>
                <Flex align='center' justify='start' mb='1' gap='8'>
                  <Box>
                    <Text as='p' size='2' weight='bold' mb='1'>
                      Gender
                    </Text>
                    <Select.Root
                      name='gender'
                      defaultValue={formState.data?.gender}
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
                disabled={isPending}
                loading={isPending}
              >
                <Save size={16} />
                {isEdit ? 'Änderungen speichern' : 'Autor*in erstellen'}
              </Button>
            </Flex>
          </Box>
        </form>
      </Card>
    </Box>
  )
}
