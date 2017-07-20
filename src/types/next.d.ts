declare module 'next'

declare module 'next/head' {
  import { Component } from 'react'
  export default class Head extends Component<{}, {}> {
    public static rewind: any
  }
}

declare module 'next/link' {
  import { Component } from 'react'
  import { Url } from 'url'
  export default class Link extends Component<
    LinkProps,
    {}
  > {}
  export interface LinkProps {
    prefetch?: boolean
    replace?: boolean
    href: string | Url
    as?: string | Url
  }
}

declare module 'next/router' {
  import { Url } from 'url'
  const router: Router
  export default router
  export interface RoutingOptions {
    shallow: boolean
  }
  export interface RouteChangeError extends Error {
    cancelled: boolean
  }
  export interface Router {
    route: string
    pathname: string
    query: any
    push(
      url: string | Url,
      pushAs?: string | Url,
      opts?: RoutingOptions
    ): void
    replace(
      url: string | Url,
      replaceAs?: string | Url,
      opts?: RoutingOptions
    ): void
    prefetch(url: string | Url): void
    onRouteChangeStart(url: string): void
    onRouteChangeComplete(url: string): void
    onRouteChangeError(
      err: RouteChangeError,
      url: string
    ): void
    onBeforeHistoryChange(url: string): void
    onAppUpdated(nextUrl: string): void
  }
}

declare module 'next-routes'

declare module 'next/document' {
  import * as React from 'react'

  interface DocumentProps {
    __NEXT_DATA__?: any
    dev?: boolean
    chunks?: string[]
    head?: Array<React.ReactElement<any>>
    styles?: Array<React.ReactElement<any>>
    [key: string]: any
  }

  class Head extends React.Component<any, {}> {}
  class Main extends React.Component<{}, {}> {}
  class NextScript extends React.Component<{}, {}> {}
  export default class extends React.Component<
    DocumentProps,
    {}
  > {}
}
