declare module 'next/head' {
  import * as React from 'react'
  export default class Head extends React.Component<any, any> {
    public static rewind(...args: any[]): any
  }
}

declare module 'next/link' {
  import * as React from 'react'
  export default class Link extends React.Component<any, any> {}
}
