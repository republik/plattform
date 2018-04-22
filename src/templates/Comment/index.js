import React from 'react'
import { css } from 'glamor'

import * as Editorial from '../../components/Typography/Editorial'

import {
  matchType,
  matchParagraph,
  matchImage
} from 'mdast-react-render/lib/utils'

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
    <Editorial.A {...props} href={screenedHref.safe}>
      {text || children}
      {screenedHref.unkown && ` [${screenedHref.unkown}]`}
    </Editorial.A>
  )
}

const styles = {
  p: css({
    margin: '10px 0',
    ':first-child': {
      marginTop: 0
    },
    ':last-child': {
      marginBottom: 0
    }
  })
}
const P = ({ children }) => (
  <p {...styles.p}>{children}</p>
)

const schema = {
  matchMdast: matchType('root'),
  component: ({ children }) => children,
  rules: [
    {
      matchMdast: matchType('heading'),
      component: ({ children }) => (
        <P><Editorial.Emphasis>{children}</Editorial.Emphasis></P>
      )
    },
    {
      matchMdast: matchParagraph,
      component: ({ children }) => <P>{children}</P>,
      rules: [
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
        }
      ]
    }
  ]
}

export default () => ({
  rules: [schema]
})
