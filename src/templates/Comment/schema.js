import React from 'react'

import {
  matchType,
  matchParagraph,
  matchImage
} from 'mdast-react-render/lib/utils'

import { HR } from '../../components/Typography'


const createCommentSchema = ({
  BlockQuote,
  BlockQuoteParagraph,
  Code,
  Container,
  Cursive,
  Emphasis,
  Heading,
  Link,
  List,
  ListItem,
  Paragraph,
  StrikeThrough
} = {}) => {
  

  const screenHref = href => {
    if (href.match(/^(https?:|\/|#)/)) {
      return {
        safe: href
      }
    }
    return {
      unkown: href
    }
  }

  const SafeA = ({ children, text, href, ...props }) => {
    const screenedHref = screenHref(href)
    return (
      <Link {...props} href={screenedHref.safe}>
        {text || children}
        {screenedHref.unkown && ` [${screenedHref.unkown}]`}
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
      component: ({ children }) => <span>[{children}]</span>
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

  return {
    rules: [
      {
        matchMdast: matchType('root'),
        component: Container,
        rules: [
          heading,
          paragraph,
          blockQuote,
          list,
          thematicBreak,
          blockLevelHtml
        ]
      }
    ]
  }
}

export default createCommentSchema
