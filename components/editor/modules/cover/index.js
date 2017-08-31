import React from 'react'
import { css } from 'glamor'
import { Block } from 'slate'
import { matchBlock, matchDocument } from '../../utils'
import { PARAGRAPH } from '../paragraph'
import { serializer as leadSerializer, LEAD } from '../lead'
import { titleSerializer, TITLE } from '../headlines'
import { COVER } from './constants'
import { CoverForm } from './ui'
import {
  rule,
  not,
  either,
  isNone,
  firstChild,
  childAt,
  childrenAfter,
  prepend,
  insertAt,
  update,
  unwrap
} from '../../utils/rules'
import { mq } from '../../styles'

export const styles = {
  cover: {
    width: '100%',
    position: 'relative',
    [mq.large]: {
      minHeight: 500,
      height: ['700px', '80vh'],
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  },
  coverImage: {
    display: 'block',
    width: '100%',
    [mq.large]: {
      display: 'none'
    }
  },
  coverLead: {
    position: 'relative',
    [mq.medium]: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
      color: '#fff',
      backgroundImage: 'linear-gradient(-180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.80) 100%)'
    }
  },
  coverLeadContainer: {
    [mq.medium]: {
      position: 'absolute',
      zIndex: 1000,
      bottom: '15%',
      left: 0,
      right: 0
    }
  },
  coverLeadCenter: {
    padding: '20px 20px 0',
    [mq.medium]: {
      textAlign: 'center',
      maxWidth: 640,
      margin: '0 auto'
    }
  }
}

const Cover = ({ node, children }) => {
  const src = node.data.get('src')
  const alt = node.data.get('alt')
  return <div
    {...css(styles.cover)}
    {...css({ [mq.large]: { backgroundImage: `url('${src}')` } })}
    >
    <img
      src={src}
      alt={alt}
      {...css(styles.coverImage)}
    />
    <div {...css(styles.coverLead)}>
      <div {...css(styles.coverLeadContainer)}>
        <div {...css(styles.coverLeadCenter)}>
          {children}
        </div>
      </div>
    </div>
  </div>
}

export const isCover = matchBlock(COVER)

export const cover = {
  match: isCover,
  render: Cover,
  matchMdast: (node) => node.type === 'zone' && node.identifier === COVER,
  fromMdast: (node, index, parent, visitChildren) => {
    // fault tolerant because markdown could have been edited outside
    const deepNodes = node.children.reduce(
      (children, child) => children
        .concat(child)
        .concat(child.children),
      []
    )
    const image = deepNodes
      .find(node => node.type === 'image') || {}
    const title = node.children
      .find(node => node.type === 'heading' && node.depth === 1)
    const lead = node.children
      .find(node => node.type === 'blockquote')

    return {
      kind: 'block',
      type: COVER,
      data: {
        src: image.url,
        alt: image.alt
      },
      nodes: [
        title && titleSerializer.fromMdast(title),
        lead && leadSerializer.fromMdast(lead)
      ].filter(Boolean)
    }
  },
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'zone',
    identifier: COVER,
    children: [
      {
        type: 'image',
        alt: object.data.alt,
        url: object.data.src
      },
      titleSerializer.toMdast(object.nodes[0]),
      leadSerializer.toMdast(object.nodes[1])
    ]
  })
}

export {
  CoverForm,
  COVER
}

const isTitle = matchBlock(TITLE)
const isLead = matchBlock(LEAD)

const onCover = rule(isCover)

export default {
  plugins: [
    {
      schema: {
        rules: [
          // Element
          cover,

          // Document restrictions
          rule(
            matchDocument,
            firstChild(not(isCover)),
            prepend(() => Block.create({
              type: COVER,
              nodes: [
                Block.create({ type: TITLE }),
                Block.create({ type: LEAD })
              ]
            }))
          ),
          // Restrictions
          onCover(
            either(
              firstChild(isNone),
              firstChild(isLead)
            ),
            prepend(() => Block.create({ type: TITLE }))
          ),
          onCover(
            firstChild(not(isTitle)),
            update(() => TITLE)
          ),
          onCover(
            childAt(1, isNone),
            insertAt(1, () => Block.create({ type: LEAD }))
          ),
          onCover(
            childAt(1, not(isLead)),
            update(() => LEAD)
          ),
          onCover(
            childrenAfter(1),
            unwrap(() => PARAGRAPH)
          )
        ]
      }
    }
  ]
}
