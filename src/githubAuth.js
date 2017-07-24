const queryString = require('query-string')
const fetch = require('isomorphic-unfetch')
const crypto = require('crypto')

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  PUBLIC_URL
} = process.env

module.exports = (server, pgdb) => {
  server.get('/auth/github/signin', (req, res) => {
    if (!req.user) {
      res.status(403).end('You need to signIn first')
      return
    }
    const {callbackPath} = req.query
    if (!callbackPath) {
      res.status(400).end('please provide callbackPath as query param')
      return
    }

    const state = crypto.randomBytes(64).toString('hex')
    const parameters = {
      client_id: GITHUB_CLIENT_ID,
      state: state,
      scope: 'repo',
      redirect_uri: `${PUBLIC_URL}/auth/github/callback`
    }

    // TODO properly save session
    req.session.callbackPath = callbackPath
    req.session.githubState = state

    res
      .status(302)
      .set('Location', `https://github.com/login/oauth/authorize?${queryString.stringify(parameters)}`)
      .end()
  })

  server.get('/auth/github/callback', async (req, res) => {
    if (!req.user) {
      res.status(403).end('You need to signIn first')
      return
    }
    if (req.query.state !== req.session.githubState) {
      res.status(404).send('invalid state')
      return
    }
    if (req.query.error) {
      res.status(500).json({
        error: req.query.error,
        error_description: req.query.error_description,
        error_uri: req.query.error_uri
      })
      return
    }

    const parameters = {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: req.query.code,
      state: req.session.githubState
    }
    try {
      const response = await fetch(
        `https://github.com/login/oauth/access_token?${queryString.stringify(parameters)}`,
        {method: 'POST', headers: {'Accept': 'application/json'}}
      )

      if (response.ok) {
        const result = await response.json()
        const callbackPath = req.session.callbackPath

        // TODO properly save session
        req.session.callbackPath = null
        req.session.githubState = null

        await pgdb.public.users.updateOne({
          id: req.user.id
        }, {
          githubAccessToken: result.access_token,
          githubScope: result.scope
        })

        res
          .status(302)
          .set(
            'Location',
            `${PUBLIC_URL}/${callbackPath || ''}`
          )
          .end()
      } else {
        res.status(response.status).json(response.data)
      }
    } catch (e) {
      console.log(e)
      res.status(500).end(e.toString())
    }
  })
}
