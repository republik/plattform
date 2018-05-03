
import React from 'react'

import {
  matchType,
  matchParagraph,
  matchImage
} from 'mdast-react-render/lib/utils'

import { HR } from '../../components/Typography'


const createCommentSchema = ({
  BlockCode,
  BlockQuote,
  BlockQuoteParagraph,
  Code,
  Container,
  Cursive,
  Definition,
  Emphasis,
  Heading,
  Link,
  List,
  ListItem,
  Paragraph,
  StrikeThrough
} = {}) => {

  const ellipsizeHref = (href = '') => {
    if (href.length > 50) {
      return href.substr(0, 35) + '…' + href.substr(href.length - 10, href.length);
    }
    return href
  }

  const screenHref = href => {
    if (href.match(/^(https?:|\/|#)/)) {
      return {
        safe: href
      }
    }
    return {
      unknown: href
    }
  }

  const SafeA = ({ children, text, href, ...props }) => {
    const screenedHref = screenHref(href)
    const ellipsizedHref = children && children[0] === href && ellipsizeHref(screenedHref.safe)
    return (
      <Link {...props} href={screenedHref.safe}>
        {text || ellipsizedHref || children}
        {screenedHref.unknown && ` [${screenedHref.unknown}]`}
      </Link>
    )
  }

  const globalInlines = [
    {
      matchMdast: matchType('break'),
      component: () => <br />
    },
    {
      matchMdast: matchImage,
      props: node => ({
        title: node.title,
        text: node.alt,
        href: node.url
      }),
      component: SafeA
    },
    {
      matchMdast: matchType('link'),
      props: node => ({
        title: node.title,
        href: node.url
      }),
      component: SafeA
    },
    // Make sure text like [...] is preserved.
    {
      matchMdast: matchType('linkReference'),
      props: node => ({
        identifier: node.identifier,
        url: node.url,
        referenceType: node.referenceType
      }),
      component: ({children, identifier, url, referenceType}) => {
        if (referenceType === 'shortcut') {
          return <span>[{identifier}]</span>
        } else {
          return <span>{children} [{identifier}]</span>
        }
      }
    },
    {
      matchMdast: matchType('imageReference'),
      props: node => ({
        identifier: node.identifier,
        alt: node.alt
      }),
      component: ({identifier, alt}) => (
        <span>{alt} [{identifier}]</span>
      )
    },
    {
      matchMdast: matchType('emphasis'),
      component: Cursive
    },
    {
      matchMdast: matchType('strong'),
      component: Emphasis
    },
    {
      matchMdast: matchType('delete'),
      component: StrikeThrough
    },
    {
      matchMdast: matchType('inlineCode'),
      props: node => ({
        value: node.value
      }),
      component: ({ value, ...props }) => <Code {...props}>{value}</Code>
    },
    {
      matchMdast: matchType('html'),
      props: node => ({
        value: node.value
      }),
      component: ({value}) => <span>{value}</span>
    },
  ]

  const heading = {
    matchMdast: matchType('heading'),
    component: Heading
  }

  const paragraph = {
    matchMdast: matchParagraph,
    component: Paragraph,
    rules: [
      ...globalInlines
    ]
  }

  const blockquoteParagraph = {
    matchMdast: matchParagraph,
    component: BlockQuoteParagraph,
    rules: [
      ...globalInlines
    ]
  }

  const blockQuote = {
    matchMdast: matchType('blockquote'),
    component: BlockQuote,
    rules: [
      blockquoteParagraph
    ]
  }

  const blockCode = {
    matchMdast: matchType('code'),
    props: node => ({
      value: node.value
    }),
    component: ({value}) => <BlockCode>{value}</BlockCode>
  }

  const list = {
    matchMdast: matchType('list'),
    component: List,
    props: node => ({
      data: {
        ordered: node.ordered,
        start: node.start,
        compact: !node.loose
      }
    }),
    rules: [
      {
        matchMdast: matchType('listItem'),
        component: ListItem,
        rules: [paragraph]
      }
    ]
  }

  const thematicBreak = {
    matchMdast: matchType('thematicBreak'),
    component: HR
  }

  const blockLevelHtml = {
    matchMdast: matchType('html'),
    props: node => ({
        value: node.value
      }),
    component: ({value}) => <Paragraph>{value}</Paragraph>
  }

  const definition = {
    matchMdast: matchType('definition'),
    props: node => ({
      identifier: node.identifier,
      url: node.url
    }),
    component: ({identifier, url}) => (
      <Definition>[{identifier}] <SafeA href={url}>{url}</SafeA></Definition>
    )
  }

  return {
    rules: [
      {
        matchMdast: matchType('root'),
        component: Container,
        rules: [
          heading,
          paragraph,
          blockQuote,
          blockCode,
          list,
          thematicBreak,
          blockLevelHtml,
          definition
        ]
      }
    ]
  }
}

export default createCommentSchema
