import React from 'react'
import { matchZone } from 'mdast-react-render/lib/utils'
import { extractImages, matchImagesParagraph } from '../../../Article/utils'
import { FigureImage } from '../../../../components/Figure'
import { Figure, Image } from '../components/Figure'
import legendRule from './legendRules'

const matchCover = (node, index) => {
  return matchZone('FIGURE') && index === 0
}

const getImageRules = isCover => [
  {
    matchMdast: matchImagesParagraph,
    component: Image,
    props: (node, _, parent, { ancestors }) => {
      const { src } = extractImages(node)
      let displayWidth = 600
      const { plain, size } = parent.data

      let fullWidth = false
      if (
        // If it's the cover image without a given sizing
        (!size && isCover) ||
        // If the image is not the cover and directly inside root
        (!isCover && ancestors.length === 2 && ancestors[1].type === 'root')
      ) {
        fullWidth = true
      }

      return {
        ...FigureImage.utils.getResizedSrcs(src, displayWidth),
        alt: node.children[0].alt,
        plain,
        size,
        fullWidth
      }
    },
    isVoid: true
  },
  legendRule
]

export const figureRule = {
  matchMdast: matchZone('FIGURE'),
  component: Figure,
  rules: getImageRules(false)
}

export const coverRule = {
  matchMdast: matchCover,
  component: ({ children }) => (
    <tr>
      <td align='center'>
        <Figure>{children}</Figure>
      </td>
    </tr>
  ),
  rules: getImageRules(true)
}
