import { headers } from 'next/headers'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'

export const { getClient } = registerApolloClient(async () => {
  const requestHeaders = await headers()
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
      uri: process.env.NEXT_PUBLIC_API_URL,
      // you can disable result caching here if you want to
      // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
      // fetchOptions: { cache: "no-store" },
      headers: {
        cookie: requestHeaders.get('cookie') ?? '',
        authorization: requestHeaders.get('authorization') ?? '',
        'x-api-gateway-client': process.env.API_GATEWAY_CLIENT ?? 'publikator',
        'x-api-gateway-token': process.env.API_GATEWAY_TOKEN ?? '',
      },
      fetchOptions: {
        next: {
          // By default we disable Next.js 13 fetch caching
          // since the requests are user based
          cache: 'no-store',
        },
      },
    }),
  })
})
