import React from 'react'
import {
  matchParagraph,
  matchType,
  matchZone,
} from '@republik/mdast-react-render'
import { Button } from '../../../../lib'
import { inlineEditorialParagraphRules } from './paragraphRule'

const buttonRule = {
  matchMdast: matchZone('BUTTON'),
  component: Button,
  props: (node) => {
    const link = (node.children[0] && node.children[0].children[0]) || {}

    return {
      ...node.data,
      title: link.title,
      href: link.url,
    }
  },
  rules: inlineEditorialParagraphRules.concat({
    matchMdast: matchParagraph,
    component: ({ children }) => children,
    rules: [
      {
        matchMdast: matchType('link'),
        component: ({ children }) => children,
        rules: inlineEditorialParagraphRules,
      },
    ],
  }),
  editorModule: 'button',
}

export default buttonRule
