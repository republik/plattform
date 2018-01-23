const { lib: { clients: createGithubClients } } = require('@orbiting/backend-modules-github')
const { Readable } = require('stream')
const { returnImage } = require('../lib')
const debug = require('debug')('assets:github')

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
  server.get('/github/:login/:repoName/:path(*)', async (req, res) => {
    const { githubRest } = await createGithubClients()

    const {
      login,
      repoName,
      path
    } = req.params
    debug('getBlob %s/%s/%s', login, repoName, path)

    const webp = new RegExp(/\.webp$/).test(path)
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
    if (!result || !result.data) {
      return res.status(404).end()
    }

    const { data: { content, size } } = result
    const stream = new Readable()
    stream._read = function () {} // _read is required but you can noop it
    stream.push(content, 'base64')
    stream.push(null)

    return returnImage({
      response: res,
      stream,
      options: {
        ...req.query,
        webp
      }
    })
  })
}
