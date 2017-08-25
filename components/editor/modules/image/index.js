import React from 'react'
import { colors } from '@project-r/styleguide'
import { css } from 'glamor'
import { matchBlock } from '../../utils'
import styles from '../../styles'
import { ImageForm, ImageButton } from './ui'
import { IMAGE } from './constants'

export const ImagePlaceholder = ({ active }) =>
  <div
    style={{ position: 'relative', width: '100%' }}
    {...css(styles.image)}
    data-active={active}
  >
    <div
      style={{
        width: '100%',
        paddingBottom: '57%',
        backgroundColor: colors.divider
      }}
    />
  </div>

export const Image = ({ src, alt, active }) =>
  <img
    style={{ width: '100%' }}
    src={src}
    alt={alt}
    data-active={active}
    {...css(styles.image)}
  />

export const image = {
  match: matchBlock(IMAGE),
  matchMdast: (node) => node.type === 'image',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: IMAGE,
    data: {
      title: node.title,
      alt: node.alt,
      src: node.url
    },
    nodes: visitChildren(node)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'image',
    title: object.data.title,
    alt: object.data.alt,
    url: object.data.src,
    children: visitChildren(object)
  }),
  render: props => {
    const { node, state } = props
    const src = node.data.get('src')
    const alt = node.data.get('alt')
    const active = state.blocks.some(block => block.key === node.key)

    if (!src) {
      return <ImagePlaceholder active={active} />
    } else {
      return <Image
        src={src}
        alt={alt}
        active={active}
      />
    }
  }
}

export {
  IMAGE,
  ImageForm,
  ImageButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          image
        ]
      }
    }
  ]
}
