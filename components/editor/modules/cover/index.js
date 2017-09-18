import React from 'react'
import { css } from 'glamor'
import { matchBlock } from '../../utils'
import addValidation, { findOrCreate } from '../../utils/serializationValidation'
import { gray2x1 } from '../../utils/placeholder'
import { PARAGRAPH } from '../paragraph'
import { serializer as leadSerializer, LEAD } from '../lead'
import { titleSerializer, TITLE } from '../headlines'
import { COVER } from './constants'
import { CoverForm } from './ui'
import {
  rule,
  childrenAfter,
  unwrap
} from '../../utils/rules'
import { mq } from '../../styles'
import MarkdownSerializer from '../../../../lib/serializer'

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
  const src = node.data.get('src') || gray2x1
  const alt = node.data.get('alt')
  return <div
    {...css(styles.cover)}
    {...css({ [mq.large]: { backgroundImage: src && `url('${src}')` } })}
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
    const image = findOrCreate(deepNodes, {type: 'image'})
    const title = findOrCreate(
      node.children,
      {type: 'heading', depth: 1},
      {children: []}
    )
    const lead = findOrCreate(
      node.children,
      {type: 'blockquote'},
      {children: []}
    )

    return {
      kind: 'block',
      type: COVER,
      data: {
        src: image.url,
        alt: image.alt
      },
      nodes: [
        titleSerializer.fromMdast(title),
        leadSerializer.fromMdast(lead)
      ]
    }
  },
  toMdast: (object, index, parent, visitChildren, context) => {
    [isTitle, isLead].some((check, index) => {
      const node = object.nodes[index]
      if (!node || !check(node)) {
        context.dirty = true
        return true
      }
    })

    return {
      type: 'zone',
      identifier: COVER,
      children: [
        {
          type: 'image',
          alt: object.data.alt,
          url: object.data.src
        },
        titleSerializer.toMdast(
          findOrCreate(object.nodes, {
            kind: 'block',
            type: TITLE
          }), context
        ),
        leadSerializer.toMdast(
          findOrCreate(object.nodes, {
            kind: 'block',
            type: LEAD
          }), context
        )
      ]
    }
  }
}

export const serializer = new MarkdownSerializer({
  rules: [
    cover
  ]
})

addValidation(cover, serializer)

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
          // Restrictions
          onCover(
            childrenAfter(1),
            unwrap(() => PARAGRAPH)
          ),

          // Element
          cover
        ]
      }
    }
  ]
}
