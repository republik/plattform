'use client'

import { useState, useEffect } from 'react'
import { Card, Flex, Text, TextField } from '@radix-ui/themes'

interface ProlitterisFieldsProps {
  initialValues?: {
    prolitterisId?: string | null
    prolitterisFirstname?: string | null
    prolitterisLastname?: string | null
  }
  getFieldError: (fieldName: string) => string | null
  hasFieldError: (fieldName: string) => boolean
  onValidationChange: (isValid: boolean, errorMessage: string | null) => void
}

interface ProlitterisFieldsData {
  prolitterisId: string
  prolitterisFirstname: string
  prolitterisLastname: string
}

export default function ProlitterisFields({
  initialValues = {},
  getFieldError,
  hasFieldError,
  onValidationChange,
}: ProlitterisFieldsProps) {
  const [prolitterisFields, setProlitterisFields] =
    useState<ProlitterisFieldsData>({
      prolitterisId: initialValues.prolitterisId || '',
      prolitterisFirstname: initialValues.prolitterisFirstname || '',
      prolitterisLastname: initialValues.prolitterisLastname || '',
    })

  const [prolitterisValidationError, setProlitterisValidationError] = useState<
    string | null
  >(null)

  useEffect(() => {
    const { prolitterisId, prolitterisFirstname, prolitterisLastname } =
      prolitterisFields

    const hasAnyValue =
      prolitterisId.trim() ||
      prolitterisFirstname.trim() ||
      prolitterisLastname.trim()

    // Check if all fields have values
    const hasAllValues =
      prolitterisId.trim() &&
      prolitterisFirstname.trim() &&
      prolitterisLastname.trim()

    let errorMessage: string | null = null
    if (hasAnyValue && !hasAllValues) {
      errorMessage =
        'Es müssen alle Prolitteris-Felder ausgefüllt werden.'
    }

    setProlitterisValidationError(errorMessage)
    onValidationChange(!errorMessage, errorMessage)
  }, [prolitterisFields, onValidationChange])

  const handleProlitterisFieldChange = (
    fieldName: keyof ProlitterisFieldsData,
    value: string,
  ) => {
    setProlitterisFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const hasFieldErrorLocal = (fieldName: string): boolean => {
    const hasServerError = hasFieldError(fieldName)
    const hasProlitterisError =
      prolitterisValidationError &&
      ['prolitterisId', 'prolitterisFirstname', 'prolitterisLastname'].includes(
        fieldName,
      )
    return hasServerError || !!hasProlitterisError
  }

  return (
    <Card>
      <Flex direction='column' gap='2'>
        {prolitterisValidationError && (
          <Text size='1' color='red' mt='1'>
            {prolitterisValidationError}
          </Text>
        )}
        <Text as='label' size='2' weight='bold' mb='0'>
          Prolitteris-ID
        </Text>
        <TextField.Root
          name='prolitterisId'
          defaultValue={prolitterisFields.prolitterisId}
          placeholder='PL-ID (falls vorhanden)'
          color={hasFieldErrorLocal('prolitterisId') ? 'red' : undefined}
          onChange={(e) =>
            handleProlitterisFieldChange('prolitterisId', e.target.value)
          }
        />
        {getFieldError('prolitterisId') && (
          <Text size='1' color='red' mt='1'>
            {getFieldError('prolitterisId')}
          </Text>
        )}
        <Text as='label' size='2' weight='bold' mb='0'>
          Prolitteris Vorname
        </Text>
        <TextField.Root
          name='prolitterisFirstname'
          defaultValue={prolitterisFields.prolitterisFirstname}
          placeholder='Vorname (falls vorhanden)'
          color={hasFieldErrorLocal('prolitterisFirstname') ? 'red' : undefined}
          onChange={(e) =>
            handleProlitterisFieldChange('prolitterisFirstname', e.target.value)
          }
        />

        <Text as='label' size='2' weight='bold' mb='0'>
          Prolitteris Nachname
        </Text>
        <TextField.Root
          name='prolitterisLastname'
          defaultValue={prolitterisFields.prolitterisLastname}
          placeholder='Nachname (falls vorhanden)'
          color={hasFieldErrorLocal('prolitterisLastname') ? 'red' : undefined}
          onChange={(e) =>
            handleProlitterisFieldChange('prolitterisLastname', e.target.value)
          }
        />
      </Flex>
    </Card>
  )
}
