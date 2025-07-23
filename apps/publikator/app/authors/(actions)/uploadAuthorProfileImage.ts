'use server'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

export interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
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