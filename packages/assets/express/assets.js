const sharp = require('sharp')
const fileType = require('file-type')
const fetch = require('isomorphic-unfetch')
const { lib: { clients: createGithubClients } } = require('@orbiting/backend-modules-github')
const { authenticate } = require('../lib')

const maxSize = 6000

const getDimensions = (resize) => {
  if (!resize) {
    return {
      width: null,
      height: null
    }
  }
  const [_width, _height] = resize.split('x')
  const width = _width ? parseInt(_width) : null
  const height = _height ? parseInt(_height) : null
  if (width && (typeof (width) !== 'number' || isNaN(width))) {
    throw new Error('invalid with')
  }
  if (height && (typeof (height) !== 'number' || isNaN(height))) {
    throw new Error('invalid height')
  }
  if (width > maxSize || height > maxSize) {
    throw new Error('maxSize: '+ maxSize)
  }
  return {
    width,
    height
  }
}

const returnImage = async (res, buffer, resize) => {
  let width, height
  try {
    const dimensions = getDimensions(resize)
    width = dimensions.width
    height = dimensions.height
  } catch(e) {
    res.status(400).end(e.message)
  }

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
}

module.exports = (server) => {
  // images out of repos
  // Because githubs get-contents is limited to 1MB the current
  // approach is to extract the blobs sha from the filename,
  // get the file via get-blob, and send the content directly as response.
  // Optimization: Find a way to get the download url of a blob
  // without requestion the content and pipe fetch(download_url) as
  // response to our request.
  // https://developer.github.com/v3/repos/contents/#get-contents
  // https://developer.github.com/v3/git/blobs/#get-a-blob
  server.get('/assets/images/:login/:repoName/:path(*)', async (req, res) => {
    const { githubRest } = await createGithubClients()

    const { resize } = req.query

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
    if (!result) {
      return res.status(404).end()
    }

    const { data: { content } } = result
    const buffer = Buffer.from(content, 'base64')

    return returnImage(res, buffer, resize)
  })

  // embed images
  server.get('/assets/images', async (req, res) => {
    const {
      originalURL: url,
      mac,
      resize
    } = req.query

    if (!url) {
      return res.status(404).end()
    }

    if (!mac || mac !== authenticate(url)) {
      console.warn('unauthorized asset url requested: '+url)
      return res.status(403).end()
    }

    const buffer = await fetch(url, {
      method: 'GET',
    })
      .then(response => response.buffer())
      .catch(error => {
        console.error('gettting image failed', { error })
        res.status(404).end()
      })

    return returnImage(res, buffer, resize)
  })

}
