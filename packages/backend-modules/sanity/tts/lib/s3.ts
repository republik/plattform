import { Readable } from 'stream'

const { s3 } = require('@orbiting/backend-modules-assets').lib

// Optional mirror of the generated audio into S3, via the assets module's
// existing S3 helper (reused rather than pulling in a second AWS SDK
// version). Sanity's file asset is the asset of record (referenced by
// audioSourceMp3); this is a backup copy only, skipped when AWS_* env vars
// aren't configured.
export const mirrorToS3 = async (documentId: string, buffer: Buffer) => {
  if (!s3.getInstance() || !process.env.AWS_S3_BUCKET) return

  await s3.upload({
    stream: Readable.from(buffer),
    path: `tts/${documentId}/${Date.now()}.mp3`,
    mimeType: 'audio/mpeg',
    bucket: process.env.AWS_S3_BUCKET,
  })
}
