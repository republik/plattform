import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { withApollo } from 'react-apollo'

import { matchBlock } from '../../utils'
import { findOrCreate } from '../../utils/serialization'

import createUi from './ui'
import embedFromUrlPlugin from './embedFromUrlPlugin'
import EmbedLoader from './EmbedLoader'

import gql from 'graphql-tag'

export const getVideoEmbed = gql`
  query getVideoEmbed($id: ID!, $embedType: EmbedType!) {
    embed(id: $id, embedType: $embedType) {
      __typename
      ... on YoutubeEmbed {
        platform
        id
        createdAt
        retrievedAt
        userName
        userUrl
        thumbnail
        title
        userName
        userProfileImageUrl
        aspectRatio
        durationMs
        mediaId
      }
      ... on VimeoEmbed {
        platform
        id
        createdAt
        retrievedAt
        userName
        userUrl
        thumbnail
        title
        userName
        userProfileImageUrl
        aspectRatio
        src {
          mp4
          hls
          thumbnail
        }
        durationMs
        mediaId
      }
    }
  }
`

export const getTwitterEmbed = gql`
  query getTwitterEmbed($id: ID!, $embedType: EmbedType!) {
    embed(id: $id, embedType: $embedType) {
      __typename
      ... on TwitterEmbed {
        id
        createdAt
        retrievedAt
        text
        html
        userId
        userName
        userScreenName
        userProfileImageUrl
        image
        more
        playable
      }
    }
  }
`

const fromMdast = ({ TYPE }) => node => {
  const deepNodes = node.children.reduce(
    (children, child) => children.concat(child).concat(child.children),
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

const toMdast = ({ TYPE }) => node => {
  const { url, ...data } = node.data
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
        matchMdast: options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })

const embedPlugin = ({ query, ...options }) => {
  const Embed = options.rule.component
  const Component = withApollo(EmbedLoader(query, Embed))

  return {
    renderNode(props) {
      const { node } = props

      if (!matchBlock(options.TYPE)(node)) {
        return
      }

      return <Component {...props} />
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

const moduleFactory = ({ query, matchUrl, getQueryParams }) => options => {
  const { rule, TYPE } = options
  return {
    helpers: {
      serializer: getSerializer(options)
    },
    changes: {},
    ui: createUi({ TYPE, editorOptions: rule.editorOptions }),
    plugins: [
      embedPlugin({ query, ...options }),
      embedFromUrlPlugin({
        matchUrl,
        getQueryParams,
        matchSource: matchBlock(rule.editorOptions.lookupType.toUpperCase()),
        TYPE
      })
    ]
  }
}

// One capturing group at match[1] that catches the status id
const TWITTER_REGEX = /^https?:\/\/twitter\.com\/(?:#!\/)?\w+\/status(?:es)?\/(\d+)$/

// One capturing group at match[1] that catches the video id
const YOUTUBE_REGEX = /^http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&[^\s]*)*$/

// One capturing group at match[1] that catches the video id
const VIMEO_REGEX = /^(?:http|https)?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|)(\d+)(?:|\/\?)$/

const matchVideoUrl = url => YOUTUBE_REGEX.test(url) || VIMEO_REGEX.test(url)

const getVideoQueryParams = url => {
  if (YOUTUBE_REGEX.test(url)) {
    return {
      embedType: 'YoutubeEmbed',
      id: YOUTUBE_REGEX.exec(url)[1]
    }
  }
  if (VIMEO_REGEX.test(url)) {
    return {
      embedType: 'VimeoEmbed',
      id: VIMEO_REGEX.exec(url)[1]
    }
  }
  throw new Error(`No valid video embed URL: ${url}`)
}

const matchTwitterUrl = url => TWITTER_REGEX.test(url)

const getTwitterQueryParams = url => {
  if (TWITTER_REGEX.test(url)) {
    return {
      embedType: 'TwitterEmbed',
      id: TWITTER_REGEX.exec(url)[1]
    }
  }
  throw new Error(`No valid twitter embed URL: ${url}`)
}

export const createEmbedVideoModule = moduleFactory({
  matchUrl: matchVideoUrl,
  getQueryParams: getVideoQueryParams,
  query: getVideoEmbed
})

export const createEmbedTwitterModule = moduleFactory({
  matchUrl: matchTwitterUrl,
  getQueryParams: getTwitterQueryParams,
  query: getTwitterEmbed
})
