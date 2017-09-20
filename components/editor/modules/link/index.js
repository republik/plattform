import React from 'react'
import { LinkButton, LinkForm } from './ui'
import { matchInline } from '../../utils'
import { LINK } from './constants'
import { css } from 'glamor'

export const styles = {
  link: {
    color: '#222',
    textDecoration: 'underline',
    ':visited': {
      color: '#222',
      textDecoration: 'underline'
    },
    ':hover': {
      color: '#444'
    }
  }
}

css.global('a, a:visited', {
  color: '#222',
  textDecoration: 'underline'
})
css.global('a:hover', {
  color: '#444'
})

export const link = {
  match: matchInline(LINK),
  matchMdast: (node) => node.type === 'link',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'inline',
    type: LINK,
    data: {
      title: node.title,
      href: node.url
    },
    nodes: visitChildren(node)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'link',
    title: object.data.title,
    url: object.data.href,
    children: visitChildren(object)
  }),
  render: ({ children, node }) => (
    <a
      href={node.getIn(['data', 'href'])}
      title={node.getIn(['data', 'title'])}
      {...css(styles.link)}
    >{ children }</a>
  )
}

export {
  LINK,
  LinkForm,
  LinkButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          link
        ]
      }
    }
  ]
}
