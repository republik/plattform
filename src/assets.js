// const fetch = require('isomorphic-unfetch')
const github = require('../lib/github')

module.exports = (server) => {
  server.get('/assets/:login/:repoName/:ref/:path(*)', async (req, res) => {
    const {
      login,
      repoName,
      ref,
      path
    } = req.params

    const result = await github.getContents(
      req.user.githubAccessToken,
      `${login}/${repoName}`,
      path,
      ref
    )

    res.end(Buffer.from(result.content, 'base64'))

    // fetch(result.download_url)
    //  .then( response => response.body.pipe(res) )
  })
}
