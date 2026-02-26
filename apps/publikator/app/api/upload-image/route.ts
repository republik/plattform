import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  const { filename, path, contentType } = await request.json()

  const ext = filename.match(/(\.[a-zA-Z0-9]+)$/)?.[1] ?? ''

  const client = new S3Client({ region: process.env.AWS_REGION })
  const { url, fields } = await createPresignedPost(client, {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${path ?? 'publikator/images'}/${uuidv4()}${ext}`,
    Conditions: [
      ['content-length-range', 0, 1024 * 1024 * 30], // up to 30 MB
      ['starts-with', '$Content-Type', contentType],
    ],
    Fields: {
      acl: 'public-read',
      'Content-Type': contentType,
    },
    Expires: 600, // Seconds before the presigned post expires. 3600 by default.
  })

  return Response.json({ url, fields })
}
