'use client'

import { useState, useTransition } from 'react'
import { Box, Button, Flex, Text, Avatar } from '@radix-ui/themes'
import { Upload, X } from 'lucide-react'
import { uploadAuthorProfileImage } from '../../authors/actions'

interface ProfileImageUploadProps {
  currentImageUrl?: string
  fallback?: string
  onImageChange: (imageUrl: string | null) => void
  error?: string
}

export default function ProfileImageUpload({
  currentImageUrl,
  fallback = '?',
  onImageChange,
  error,
}: ProfileImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentImageUrl || null,
  )
  const [isPending, startTransition] = useTransition()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      try {
        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImagePreview(result)
        }
        reader.readAsDataURL(file)

        // Upload the image
        const result = await uploadAuthorProfileImage(file)

        if (result.success && result.url) {
          setImagePreview(result.url)
          onImageChange(result.url)
        } else {
          setImagePreview(currentImageUrl || null)
          onImageChange(currentImageUrl || null)
        }
      } catch (error) {
        setImagePreview(currentImageUrl || null)
        onImageChange(currentImageUrl || null)
      }
    })
  }

  const removeImage = () => {
    setImagePreview(null)
    onImageChange(null)
  }

  return (
    <Box>
      <Text as='label' size='2' weight='bold' mb='2'>
        Profilbild
      </Text>
      <Flex direction='column' gap='3'>
        <Flex align='center' gap='3'>
          <Avatar
            src={imagePreview || currentImageUrl || undefined}
            fallback={fallback}
            size='8'
          />
          <Flex direction='column' gap='2'>
            <Button
              type='button'
              variant='soft'
              size='1'
              disabled={isPending}
              onClick={() =>
                document.getElementById('image-upload')?.click()
              }
            >
              <Upload size={14} />
              {isPending
                ? 'Wird hochgeladen...'
                : imagePreview
                ? 'Bild ersetzen'
                : 'Bild hochladen'}
            </Button>
            {imagePreview && (
              <Button
                type='button'
                variant='outline'
                size='1'
                color='red'
                onClick={removeImage}
                disabled={isPending}
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
          disabled={isPending}
        />
        {error && (
          <Text size='1' color='red'>
            {error}
          </Text>
        )}
      </Flex>
    </Box>
  )
}
