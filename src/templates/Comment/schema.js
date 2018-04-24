import React from 'react'

import {
  matchType,
  matchParagraph,
  matchImage
} from 'mdast-react-render/lib/utils'


const createCommentSchema = ({
  Cursive,
  Emphasis,
  StrikeThrough,
  Link,
  List,
  ListItem,
  P,
  BlockQuote,
  Heading,
  HR,
  Code
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
    component: ({ children }) => <P>{children}</P>,
    rules: [
      ...globalInlines,

    ]
  }

  const blockQuote = {
    matchMdast: matchType('blockquote'),
    component: BlockQuote,
    rules: [
      ...globalInlines,
      {
        matchMdast: matchParagraph,
        component: ({ children }) => children
      }
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
      component: ({value}) => <P>{value}</P>
  }

  return {
    rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children }) => children,
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
