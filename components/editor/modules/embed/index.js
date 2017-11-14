import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { gql, withApollo } from 'react-apollo'

import { matchBlock } from '../../utils'
import { findOrCreate } from '../../utils/serialization'

import embedFromUrlPlugin from './embedFromUrlPlugin'
import EmbedLoader from './EmbedLoader'

const videoQuery = gql`
query getVideoEmbed($url: String!) {
  embed(url: $url) {
    __typename
    ... on Youtube {
      id
      userId
      userName
      thumbnail
    }
    ... on Vimeo {
      id
      userId
      userName
      thumbnail
    }
  }
}
`

const twitterQuery = gql`
query getTwitterEmbed($url: String!) {
  embed(url: $url) {
    __typename
    ... on Twitter {
      id
      text
      userId
      userName
      userScreenName
    }
  }
}
`

const fromMdast = ({ TYPE }) => (
  node,
  index,
  parent,
  visitChildren
) => {
  const deepNodes = node.children.reduce(
    (children, child) =>
      children
        .concat(child)
        .concat(child.children),
    []
  )
  const link = findOrCreate(deepNodes, {
    type: 'link'
  })
  return {
    kind: 'block',
    type: TYPE,
    isVoid: true,
    data: {
      ...node.data,
      url: link.url
    }
  }
}

const toMdast = ({ TYPE }) => (
  node,
  index,
  parent,
  visitChildren
) => {
  const {
    url,
    ...data
  } = node.data
  return {
    type: 'zone',
    identifier: TYPE,
    data,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url,
            children: [
              {
                type: 'text',
                value: url
              }
            ]
          }
        ]
      }
    ]
  }
}

const getSerializer = options =>
  new MarkdownSerializer({
    rules: [
      {
        match: matchBlock(options.TYPE),
        matchMdast:
          options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })

const embedPlugin = ({ query, ...options }) => {
  const Embed = options.rule.component
  const Component = withApollo(EmbedLoader(query, Embed))

  return {
    renderNode (props) {
      const {
        node
      } = props

      if (!matchBlock(options.TYPE)(node)) {
        return
      }

      return (
        <Component {...props} />
      )
    },
    schema: {
      blocks: {
        [options.TYPE]: {
          isVoid: true
        }
      }
    }
  }
}

const moduleFactory = ({ query, matchUrl }) => options => {
  const { rule, TYPE } = options
  return {
    helpers: {
      serializer: getSerializer(options)
    },
    changes: {},
    plugins: [
      embedPlugin({ query, ...options }),
      embedFromUrlPlugin({
        matchUrl,
        matchSource: matchBlock(
          rule.editorOptions.lookupType.toUpperCase()
        ),
        TYPE
      })
    ]
  }
}

const YOUTUBE_REGEX = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/

const VIMEO_REGEX = /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|)(\d+)(?:|\/\?)/

const TWITTER_REGEX = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/

export const createEmbedVideoModule = moduleFactory({
  matchUrl: v => YOUTUBE_REGEX.test(v) || VIMEO_REGEX.test(v),
  query: videoQuery
})

export const createEmbedTwitterModule = moduleFactory({
  matchUrl: v => TWITTER_REGEX.test(v),
  query: twitterQuery
})
