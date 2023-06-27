import React from 'react'
import {
  matchHeading,
  matchParagraph,
  matchZone,
} from '@republik/mdast-react-render'
import inlineRules from './inlineRules'
import { interactionParagraphRule } from './paragraphRule'
import { linkRule } from './linkRule'
import {
  TitleBlock,
  Headline,
  Lead,
  Subject,
  Credits,
} from '../components/TitleBlock'

const titleBlockRule = {
  matchMdast: matchZone('TITLE'),
  component: TitleBlock,
  props: (node, index, parent, { ancestors }) => {
    const root = ancestors[ancestors.length - 1]

    return {
      center: node.data.center,
      breakout: node.data.breakout,
      format: root.meta?.format,
      series: root.meta?.series,
      repoId: root.repoId,
      path: root.meta?.path,
    }
  },
  rules: [
    // Headline
    {
      matchMdast: matchHeading(1),
      component: Headline,
      rules: inlineRules,
    },
    // Subject
    {
      matchMdast: matchHeading(2),
      component: Subject,
      rules: inlineRules,
    },
    // Lead
    {
      matchMdast: (node, index, parent) => {
        const numHeadings = parent.children.filter(
          (child) => child.type === 'heading',
        ).length
        return matchParagraph(node) && index === numHeadings
      },
      component: Lead,
    },
    // Credits
    {
      matchMdast: matchParagraph,
      component: Credits,
      rules: [interactionParagraphRule, linkRule],
    },
  ],
}

export default titleBlockRule
