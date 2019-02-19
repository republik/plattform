const fetch = require('isomorphic-unfetch')
const { lib: { appAuth: { getInstallationToken } } } = require('@orbiting/backend-modules-github')
const { returnImage } = require('../lib')
const debug = require('debug')('assets:github')

let installationToken

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
    const nearFuture = new Date()
    nearFuture.setMinutes(nearFuture.getMinutes() + 15)
    if (!installationToken || installationToken.expiresAt < nearFuture) {
      installationToken = await getInstallationToken()
    }

    const {
      login,
      repoName,
      path
    } = req.params
    debug('getBlob %s/%s/%s', login, repoName, path)

    const webp = new RegExp(/\.webp$/).test(path)

    // the filename is the blobSha
    const blobSha = path
      .split('/')
      .pop()
      .split('.')[0]

    const result = await fetch(`https://api.github.com/repos/${login}/${repoName}/git/blobs/${blobSha}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${installationToken.token}`,
        // https://developer.github.com/v3/media/#git-blob-properties
        'Accept': 'application/vnd.github.v3.raw'
      }
    })
      .catch(error => {
        if (error.code === 404) {
          res.status(404).end()
        } else {
          console.error(error)
          res.status(500).end()
        }
      })

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers,
      path,
      options: {
        ...req.query,
        webp,
        cacheTags: ['github']
      }
    })
  })
}
