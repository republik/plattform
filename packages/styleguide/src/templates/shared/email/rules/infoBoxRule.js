import React from 'react'
import {
  matchHeading,
  matchParagraph,
  matchType,
  matchZone,
} from '@republik/mdast-react-render'
import InfoBox, { Title, SubTitle, Text } from '../components/InfoBox'
import { Figure } from '../components/Figure'
import { getImageRules } from './figureRule'
import inlineRules from './inlineRules'
import { inlineInteractionParagraphRules } from './paragraphRule'
import List, { ListItem } from '../components/List'

const infoBoxParagraphRule = {
  matchMdast: matchParagraph,
  component: Text,
  rules: inlineInteractionParagraphRules,
}

const infoBoxRule = {
  matchMdast: matchZone('INFOBOX'),
  component: InfoBox,
  rules: [
    {
      matchMdast: matchHeading(3),
      component: Title,
      rules: inlineRules,
    },
    {
      matchMdast: matchHeading(4),
      component: SubTitle,
      rules: inlineRules,
    },
    infoBoxParagraphRule,
    {
      matchMdast: matchType('list'),
      component: List,
      props: (node) => ({
        ordered: node.ordered,
        start: node.start,
      }),
      rules: [
        {
          matchMdast: matchType('listItem'),
          component: ListItem,
          rules: [
            {
              ...infoBoxParagraphRule,
              props: () => ({
                noMargin: true,
              }),
            },
          ],
        },
      ],
    },
    {
      matchMdast: matchZone('FIGURE'),
      component: Figure,
      rules: getImageRules({ forceWidth: '155px' }),
    },
  ],
}

export default infoBoxRule
