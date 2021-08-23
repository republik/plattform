import React from 'react'
import { matchZone } from 'mdast-react-render/lib/utils'
import { extractImages, matchImagesParagraph } from '../../../Article/utils'
import { FigureImage } from '../../../../components/Figure'
import Image from '../components/Image'

const figureRule = {
  matchMdast: matchZone('FIGURE'),
  component: props => {
    return <div style={{ textAlign: 'center' }}>{props.children}</div>
  },
  props: (node, index, parent, test) => {
    console.log(node)
    console.log(parent)
    console.log(test)
    return node.data
  },
  rules: [
    {
      matchMdast: matchImagesParagraph,
      component: Image,
      props: (node, index, parent) => {
        console.log(node)
        console.log(parent)
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
    }
  ]
}

export default figureRule
