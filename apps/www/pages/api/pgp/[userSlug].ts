import { NextApiRequest, NextApiResponse } from 'next'
import withReqMethodGuard from '../../../lib/api/withReqMethodGuard'
import HTTPMethods from '../../../lib/api/HTTPMethods'
import { createApolloFetch } from 'apollo-fetch'

export default withReqMethodGuard(
  async function (req: NextApiRequest, res: NextApiResponse) {
    const apolloFetch = createApolloFetch({
      uri: process.env.NEXT_PUBLIC_API_URL,
    })
    let { userSlug: userSlugWithSuffix } = req.query
    if (Array.isArray(userSlugWithSuffix)) {
      userSlugWithSuffix = userSlugWithSuffix.join('')
    }

    if (!userSlugWithSuffix?.endsWith('.asc')) {
      return res.status(404).end()
    }
    const userSlug = userSlugWithSuffix.replace('.asc', '')

    apolloFetch.use(({ request, options }, next) => {
      if (!options.headers) {
        options.headers = {}
      }
      options.headers['cookie'] = req.headers.cookie
      options.headers['x-api-gateway-client'] =
        process.env.API_GATEWAY_CLIENT ?? 'www'
      options.headers['x-api-gateway-token'] =
        process.env.API_GATEWAY_TOKEN ?? ''

      next()
    })

    const response = await apolloFetch({
      query: `
      query pgpPublicKey($slug: String!) {
        user(slug: $slug) {
          username
          name
          pgpPublicKey
        }
      }
    `,
      variables: {
        slug: userSlug,
      },
    })

    if (response.errors) {
      return res.status(503).end()
    }
    const { user } = response.data
    if (!user || !user.pgpPublicKey) {
      return res.status(404).end()
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${user.username || user.name}.asc"`,
    )
    return res.send(user.pgpPublicKey)
  },
  [HTTPMethods.GET],
)
