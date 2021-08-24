import React from 'react'
import { matchZone } from 'mdast-react-render/lib/utils'
import { extractImages, matchImagesParagraph } from '../../../Article/utils'
import { FigureImage } from '../../../../components/Figure'
import { Figure, Image } from '../components/Figure'
import legendRule from './legendRules'
import Center from '../components/Center'

const imageRules = [
  {
    matchMdast: matchImagesParagraph,
    component: Image,
    props: (node, index, parent) => {
      console.log(parent.data.size)
      const { src } = extractImages(node)
      const displayWidth = 600
      const { plain } = parent.data

      return {
        ...FigureImage.utils.getResizedSrcs(src, displayWidth),
        alt: node.children[0].alt,
        plain
      }
    },
    isVoid: true
  },
  legendRule
]

export const figureRule = {
  matchMdast: matchZone('FIGURE'),
  component: Figure,
  rules: imageRules
}

export const coverRule = {
  matchMdast: (node, index) => {
    return matchZone('FIGURE') && index === 0
  },
  component: ({ children }) => (
    <Center>
      <Figure>{children}</Figure>
    </Center>
  ),
  rules: imageRules
}
