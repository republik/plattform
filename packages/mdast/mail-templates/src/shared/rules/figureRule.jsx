import { matchType, matchZone } from '@republik/mdast-react-render'
import { CoverFigure, EdgeToEdgeFigure, Figure, Image } from "../components/Figure";
import legendRule from './legendRules'
import { getImageSize, isRelativeSize } from '../util/ImageSizingUtil'
import { getNodeDepth } from '../util/NodeDepthUtil'
import { extractImages, matchImagesParagraph } from '../util/matchers'
import { getResizedSrcs } from '../../styleguide-clone/components/Figure/utils'

const matchCover = (node, index) => {
  return matchZone('FIGURE') && index === 0
}

// Check if the figure is a direct child of the root-node
const isRootLevel = (ancestors) => getNodeDepth(ancestors, matchType('root')) === 1

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


      const displayWidth = isRootLevel(ancestors) ? '1280px' : '600px'

      let width = forceWidth ? forceWidth : getImageSize({ displayWidth, size })

      if (
        // If it's the cover image without a given sizing
        (!size && isCover) ||
        // If the image is not the cover and directly inside root
        (!isCover && isRootLevel(ancestors))
      ) { width = getImageSize({ fill: true })}

      return {
        ...getResizedSrcs(src, undefined, displayWidth),
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
  component: CoverFigure,
  rules: getImageRules({ isCover: true }),
}

export const edgeToEdgeFigureRule = {
  matchMdast: matchZone('FIGURE'),
  component: EdgeToEdgeFigure,
  rules: getImageRules(),
}
