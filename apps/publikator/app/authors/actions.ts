'use server'

import { getClient } from '../../lib/apollo/client'
import {
  UpsertContributorDocument,
  MutationsUpsertContributorArgs,
  ArticleContributor,
  UpsertContributorError,
  DeleteContributorDocument,
} from '../../graphql/republik-api/__generated__/gql/graphql'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

export interface UpdateAuthorState {
  success: boolean
  errors: UpsertContributorError[]
  warnings: string[]
  data?: ArticleContributor
}

export interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
}

export const upsertAuthor = async (
  prevState: UpdateAuthorState,
  formData: FormData,
) => {
  const client = await getClient()
  const data = Object.fromEntries(formData) as MutationsUpsertContributorArgs

  // Prepare mutation variables - we'll reuse this for preserving form data
  const submittedFormData = {
    id: data.id || undefined,
    name: data.name,
    shortBio: data.shortBio || undefined,
    image: data.image || undefined,
    bio: data.bio || undefined,
    userId: data.userId || undefined,
    prolitterisId: data.prolitterisId || undefined,
    prolitterisFirstname: data.prolitterisFirstname || undefined,
    prolitterisLastname: data.prolitterisLastname || undefined,
    gender: data.gender,
  }

  const submittedContributorData: ArticleContributor = {
    ...submittedFormData,
    slug: prevState.data?.slug || '',
    createdAt: prevState.data?.createdAt || new Date().toISOString(),
    updatedAt: prevState.data?.updatedAt || new Date().toISOString(),
  }

  try {
    const result = await client.mutate({
      mutation: UpsertContributorDocument,
      variables: submittedFormData,
    })

    const mutationResult = result.data?.upsertContributor

    if (mutationResult?.errors && mutationResult.errors.length > 0) {
      return {
        success: false,
        errors: mutationResult.errors.map((error) => ({
          field: error.field || null,
          message: error.message,
        })),
        warnings: [],
        data: submittedContributorData,
      }
    }

    const warnings = mutationResult?.warnings || []

    if (mutationResult?.contributor) {
      return {
        success: true,
        errors: [],
        warnings: warnings,
        data: mutationResult.contributor,
      }
    }

    return {
      success: false,
      errors: [{ field: null, message: 'Unbekannter Fehler beim Speichern' }],
      warnings: [],
      data: submittedContributorData,
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: null,
          message:
            error instanceof Error
              ? error.message
              : 'Ein unerwarteter Fehler ist aufgetreten',
        },
      ],
      warnings: [],
      data: submittedContributorData,
    }
  }
}

export const deleteAuthor = async (id: string) => {
  const client = await getClient()
  try {
    const result = await client.mutate({
      mutation: DeleteContributorDocument,
      variables: { id },
    })
    return result.data?.deleteContributor
  } catch (error) {
    return {
      success: false,
      errors: [
        { field: null, message: 'Ein unerwarteter Fehler ist aufgetreten' },
      ],
    }
  }
}

export const uploadAuthorProfileImage = async (
  image: File,
): Promise<UploadImageResult> => {
  const {
    AWS_S3_BUCKET,
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    ASSETS_SERVER_BASE_URL,
  } = process.env

  // Validate all required environment variables
  const missingVars = []
  if (!AWS_REGION) missingVars.push('AWS_REGION')
  if (!AWS_S3_BUCKET) missingVars.push('AWS_S3_BUCKET')
  if (!AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID')
  if (!AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY')
  if (!ASSETS_SERVER_BASE_URL) missingVars.push('ASSETS_SERVER_BASE_URL')

  if (missingVars.length > 0) {
    return {
      success: false,
      error: `Missing required environment variables: ${missingVars.join(
        ', ',
      )}`,
    }
  }

  try {
    // Configure AWS SDK
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    })

    // Generate unique filename
    const fileId = uuidv4()
    const fileName = `${fileId}.jpeg`
    const s3Path = `publikator/author-images/${fileName}`

    // Convert File to Buffer
    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: s3Path,
        Body: buffer,
        ContentType: 'image/jpeg',
      }),
    )

    // Generate public URL
    const publicUrl = `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}/${s3Path}`

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Error uploading author profile image:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during upload',
    }
  }
}
