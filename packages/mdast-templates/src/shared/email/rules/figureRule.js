import React from 'react'
import { matchType, matchZone } from 'mdast-react-render/lib/utils'
import { extractImages, matchImagesParagraph } from '../../../Article/utils'
import { FigureImage } from '@project-r/styleguide/src/components/Figure'
import { Figure, Image } from '../components/Figure'
import legendRule from './legendRules'
import { getImageSize, isRelativeSize } from '../util/ImageSizingUtil'
import { getNodeDepth } from '../util/NodeDepthUtil'

const matchCover = (node, index) => {
  return matchZone('FIGURE') && index === 0
}

/**
 * Get Image rules
 * @param displayWidth The image is resized to this
 * @param forceWidth force the images to be of a certain width
 * @param isCover
 */
export const getImageRules = ({ forceWidth, isCover } = {}) => [
  {
    matchMdast: matchImagesParagraph,
    component: Image,
    props: (node, _, parent, { ancestors }) => {
      const { src } = extractImages(node)
      const altText = node.children[0].alt
      const { plain, size } = parent.data

      // Check if the figure is a direct child of the root-node
      const displayWidth =
        getNodeDepth(ancestors, matchType('root')) === 1 ? '1280px' : '600px'

      let width = forceWidth ? forceWidth : getImageSize({ displayWidth, size })

      if (
        // If it's the cover image without a given sizing
        (!size && isCover) ||
        // If the image is not the cover and directly inside root
        (!isCover && getNodeDepth(ancestors, matchType('root')) === 1)
      )
        width = getImageSize({ fill: true })

      return {
        ...FigureImage.utils.getResizedSrcs(src, undefined, displayWidth),
        alt: altText,
        plain,
        width: width,
        // If the width is a relative size make sure the src is resized to the display-width
        resize: isRelativeSize(width) ? displayWidth : undefined,
      }
    },
    isVoid: true,
  },
  legendRule,
]

export const figureRule = {
  matchMdast: matchZone('FIGURE'),
  component: Figure,
  rules: getImageRules(),
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
  rules: getImageRules({ isCover: true }),
}

export const edgeToEdgeFigureRule = {
  matchMdast: matchZone('FIGURE'),
  component: ({ children }) => (
    <tr>
      <td>
        <Figure>{children}</Figure>
      </td>
    </tr>
  ),
  rules: getImageRules(),
}
