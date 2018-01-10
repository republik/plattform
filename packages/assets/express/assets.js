const sharp = require('sharp')
const fileType = require('file-type')
const { lib: { clients: createGithubClients } } = require('@orbiting/backend-modules-github')

const maxSize = 6000

// Because githubs get-contents is limited to 1MB the current
// approach is to extract the blobs sha from the filename,
// get the file via get-blob, and send the content directly as response.
// Optimization: Find a way to get the download url of a blob
// without requestion the content and pipe fetch(download_url) as
// response to our request.
// https://developer.github.com/v3/repos/contents/#get-contents
// https://developer.github.com/v3/git/blobs/#get-a-blob
module.exports = (server) => {
  server.get('/assets/:login/:repoName/:path(*)', async (req, res) => {
    const { githubRest } = await createGithubClients()

    const { resize } = req.query
    let width, height
    if (resize) {
      let [_width, _height] = resize.split('x')
      width = _width ? parseInt(_width) : null
      height = _height ? parseInt(_height) : null
      if (width && (typeof (width) !== 'number' || isNaN(width))) {
        return res.status(400).end('invalid width')
      }
      if (height && (typeof (height) !== 'number' || isNaN(height))) {
        return res.status(400).end('invalid height')
      }
      if (width > maxSize || height > maxSize) {
        return res.status(400).end('max size: ' + maxSize)
      }
    }

    const {
      login,
      repoName,
      path
    } = req.params

    const blobSha = path
      .split('/')
      .pop()
      .split('.')[0]

    const result = await githubRest.gitdata.getBlob({
      owner: login,
      repo: repoName,
      sha: blobSha
    })
      .catch(error => {
        if (error.code === 404) {
          res.status(404).end()
        } else {
          console.error(error)
          res.status(500).end()
        }
      })
    if (!result) return

    const { data: { content } } = result

    const buffer = Buffer.from(content, 'base64')
    const type = fileType(buffer)
    const isJPEG = type && type.ext === 'jpg'

    if (width || height || isJPEG) {
      let image = sharp(buffer)
      if (width || height) {
        image = image.resize(width, height)
      }
      if (isJPEG) {
        image = image.jpeg({
          progressive: true,
          quality: 80
        })
      }
      return res.end(await image.toBuffer())
    }

    return res.end(buffer)
  })
}
