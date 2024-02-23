import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'

export function getServerClient(
  req: Request,
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        accept: req.headers.get('accept') ?? '',
        Authorization: req.headers.get('Authorization') ?? '',
      },
      fetchOptions: {
        next: {
          cache: 'no-store',
        },
      },
    }),
  })
}
