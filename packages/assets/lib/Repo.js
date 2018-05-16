const { lib: {
  clients: createGithubClients
} } = require('@orbiting/backend-modules-github')
const {
  upload: uploadS3,
  getHead
} = require('./s3')
const Promise = require('bluebird')
const debug = require('debug')('assets:lib:Repo')

const CONCURRENCY = 2

const {
  ASSETS_SERVER_BASE_URL,
  AWS_S3_BUCKET
} = process.env

const getS3UrlForGithubPath = (repoId, path) =>
  `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}/github/${repoId}/${path}`

const getS3PathForGithubPath = (repoId, path) =>
  `github/${repoId}/${path.split('?').shift()}`

const uploadImages = async (repoId, paths) => {
  const { githubRest } = await createGithubClients()
  const [owner, repo] = repoId.split('/')

  await Promise.map(paths, async path => {
    // the filename is the blobSha
    const blobSha = path
      .split('/')
      .pop()
      .split('.')[0]

    const s3Path = getS3PathForGithubPath(repoId, path)

    if (!await getHead({ bucket: AWS_S3_BUCKET, path: s3Path })) {
      let result
      let error

      try {
        result = await githubRest.gitdata.getBlob({
          owner,
          repo,
          sha: blobSha
        })
      } catch (e) {
        error = e
        result = null
      }

      if (error || !result || !result.data || !result.data.content) {
        console.error(
          'getBlob failed for ',
          { owner, repo, blobSha, path, error }
        )
        throw new Error(`getBlob failed for: ${s3Path}`)
      }

      return uploadS3({
        stream: Buffer.from(result.data.content, 'base64'),
        path: s3Path,
        bucket: AWS_S3_BUCKET
      })
    } else {
      debug('uploadImages exists %s', s3Path)
    }
  },
  { concurrency: CONCURRENCY })
}

module.exports = {
  getS3UrlForGithubPath,
  getS3PathForGithubPath,
  uploadImages
}
