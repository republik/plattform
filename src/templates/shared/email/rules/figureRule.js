import React from 'react'
import { matchZone } from 'mdast-react-render/lib/utils'
import { extractImages, matchImagesParagraph } from '../../../Article/utils'
import { FigureImage } from '../../../../components/Figure'
import { Figure, Image } from '../components/Figure'
import legendRule from './legendRules'

const imageRules = [
  {
    matchMdast: matchImagesParagraph,
    component: Image,
    props: (node, index, parent) => {
      const { src } = extractImages(node)
      let displayWidth = 600
      const { plain, size } = parent.data
      return {
        ...FigureImage.utils.getResizedSrcs(src, displayWidth),
        alt: node.children[0].alt,
        plain,
        size
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
    <tr>
      <td align='center'>
        <Figure>{children}</Figure>
      </td>
    </tr>
  ),
  rules: imageRules
}
