const {
  lib: { s3 },
} = require('@orbiting/backend-modules-assets')
const { slugify } = require('@orbiting/backend-modules-utils')

import { RepoFileRow } from '../../loaders/File'

const { ASSETS_SERVER_BASE_URL, AWS_S3_BUCKET } = process.env

export function getKey(file: RepoFileRow): string {
  return ['repos', file.repoId, 'files', file.id, file.name].join('/')
}

export function getSafeFileName(name: string): string {
  const safeName = slugify(name)

  if (!safeName?.length) {
    throw new Error('unable to generate a safe name')
  }

  return safeName
}

export function getUploadUrl(file: RepoFileRow): string {
  return s3.getInstance().getSignedUrl('putObject', {
    Bucket: AWS_S3_BUCKET,
    Key: getKey(file),
    ACL: 'private',
    Expires: 60 * 15, // expires in 15 minutes
  })
}

export function getPrivateUrl(file: RepoFileRow): string {
  return s3.getInstance().getSignedUrl('getObject', {
    Bucket: AWS_S3_BUCKET,
    Key: getKey(file),
    Expires: 60 * 60,
  })
}

export function updateAcl(file: RepoFileRow): Promise<unknown> {
  return s3
    .getInstance()
    .putObjectAcl({
      Bucket: AWS_S3_BUCKET,
      Key: getKey(file),
      ACL: file.status === 'Public' ? 'public-read' : 'private',
    })
    .promise()
}

export function destroy(file: RepoFileRow): Promise<unknown> {
  return s3
    .getInstance()
    .deleteObject({
      Bucket: AWS_S3_BUCKET,
      Key: getKey(file),
    })
    .promise()
}

export function getPublicUrl(file: RepoFileRow): string {
  return [ASSETS_SERVER_BASE_URL, 's3', AWS_S3_BUCKET, getKey(file)].join('/')
}
