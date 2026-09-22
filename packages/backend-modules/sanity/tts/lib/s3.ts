const { s3 } = require('@orbiting/backend-modules-assets').lib

// Optional mirror of the generated audio into S3, via the assets module's
// existing S3 helper (reused rather than pulling in a second AWS SDK
// version). Sanity's file asset is the asset of record (referenced by
// audioSourceMp3); this is a backup copy only.
//
// Gated by its own ENABLE_TTS_S3_MIRROR flag (not just the shared AWS_*
// config) so this feature can be turned off independently of every other
// backend feature that also uses the same S3 bucket/credentials.
export const mirrorToS3 = async (documentId: string, buffer: Buffer) => {
  if (process.env.ENABLE_TTS_S3_MIRROR !== 'true') return
  if (!s3.getInstance() || !process.env.AWS_S3_BUCKET) return

  await s3.upload({
    // Pass the Buffer directly, not wrapped in a Readable — AWS SDK v2's
    // putObject needs to know the body's byte length upfront to set
    // Content-Length, and a generic Readable (unlike e.g. fs.ReadStream)
    // doesn't expose one, which throws "Cannot determine length of
    // [object Object]". A Buffer's length is known directly.
    stream: buffer,
    path: `tts/${documentId}/${Date.now()}.mp3`,
    mimeType: 'audio/mpeg',
    bucket: process.env.AWS_S3_BUCKET,
  })
}
