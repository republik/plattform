import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Editor as SlateEditor } from 'slate'
import { css } from 'glamor'

import MarkdownSerializer from '../../lib/serializer'
import addValidation, { findOrCreate, rawNodeToNode } from './utils/serializationValidation'
import styles from './styles'
import Sidebar from './Sidebar'
import MetaData from './modules/meta/ui'

import marks, {
  BoldButton,
  ItalicButton
} from './modules/marks'

import headlines, {
  MediumHeadlineButton, SmallHeadlineButton
} from './modules/headlines'

import lead from './modules/lead'

import paragraph, {
  ParagraphButton
} from './modules/paragraph'

import link, {
  LinkButton,
  LinkForm
} from './modules/link'

import image, {
  ImageForm,
  ImageButton
} from './modules/image'

import cover, {
  CoverForm, serializer as coverSerializer, COVER
} from './modules/cover'

import center, {
  serializer as centerSerializer, TYPE as CENTER
} from './modules/center'

const newsletterStyles = {
  fontFamily: 'serif',
  fontSize: 18,
  color: '#444',
  WebkitFontSmoothing: 'antialiased',
  maxWidth: 'calc(100vw - 190px)'
}

const autoMeta = documentNode => {
  const data = documentNode.data
  const autoMeta = !data || !data.size || data.get('auto')
  if (!autoMeta) {
    return null
  }
  const cover = documentNode.nodes
    .find(n => n.type === COVER && n.kind === 'block')
  if (!cover) {
    return null
  }

  const newData = data
    .set('auto', true)
    .set('title', cover.nodes.first().text)
    .set('description', cover.nodes.get(1).text)
    .set('image', cover.data.get('src'))

  return data.equals(newData)
    ? null
    : newData
}

const metaRule = {
  match: node => node.kind === 'document',
  validate: autoMeta,
  normalize: (transform, object, newData) => {
    return transform.setNodeByKey(object.key, {
      data: newData
    })
  }
}

const documentRule = {
  match: object => object.kind === 'document',
  matchMdast: node => node.type === 'root',
  fromMdast: (node, index, parent, visitChildren) => {
    const cover = findOrCreate(node.children, {
      type: 'zone', identifier: COVER
    }, {
      children: []
    })

    const center = findOrCreate(node.children, {
      type: 'zone', identifier: CENTER
    }, {
      children: []
    })

    const centerIndex = node.children.indexOf(center)
    node.children.forEach((child, index) => {
      if (child !== cover && child !== center) {
        center.children[index > centerIndex ? 'push' : 'unshift'](child)
      }
    })

    const documentNode = {
      data: node.meta,
      kind: 'document',
      nodes: [
        coverSerializer.fromMdast(cover),
        centerSerializer.fromMdast(center)
      ]
    }

    const newData = autoMeta(
      rawNodeToNode(documentNode)
    )
    if (newData) {
      documentNode.data = newData.toJS()
    }

    return {
      document: documentNode,
      kind: 'state'
    }
  },
  toMdast: (object, index, parent, visitChildren, context) => {
    const firstNode = object.nodes[0]
    if (!firstNode || firstNode.type !== COVER || firstNode.kind !== 'block') {
      context.dirty = true
    }
    const secondNode = object.nodes[1]
    if (!secondNode || secondNode.type !== CENTER || secondNode.kind !== 'block') {
      context.dirty = true
    }
    if (object.nodes.length !== 2) {
      context.dirty = true
    }

    const cover = findOrCreate(object.nodes, { kind: 'block', type: COVER })
    const center = findOrCreate(object.nodes, { kind: 'block', type: CENTER })
    const centerIndex = object.nodes.indexOf(center)
    object.nodes.forEach((node, index) => {
      if (node !== cover && node !== center) {
        center.nodes[index > centerIndex ? 'push' : 'unshift'](node)
      }
    })
    return {
      type: 'root',
      meta: object.data,
      children: [
        coverSerializer.toMdast(cover),
        centerSerializer.toMdast(center)
      ]
    }
  }
}

export const serializer = new MarkdownSerializer({
  rules: [
    documentRule
  ]
})

export const newDocument = ({title}) => {
  return serializer.deserialize(
    `<section><h6>${COVER}</h6>\n\n# ${title}\n\n<hr/></section>\n\nLadies and Gentlemen,`
  )
}

addValidation(documentRule, serializer)

const documentPlugin = {
  schema: {
    rules: [
      documentRule,
      metaRule
    ]
  }
  // onBeforeChange: (state, editor) => {
  //   const newData = autoMeta(state.document)

  //   if (!newData) {
  //     return state
  //   }

  //   return state.transform()
  //     .setNodeByKey(state.document.key, {
  //       data: newData
  //     })
  //     .apply()
  // }
}

const plugins = [
  documentPlugin,
  ...marks.plugins,
  ...headlines.plugins,
  ...lead.plugins,
  ...paragraph.plugins,
  ...link.plugins,
  ...image.plugins,
  ...cover.plugins,
  ...center.plugins
]

const textFormatButtons = [
  BoldButton,
  ItalicButton,
  LinkButton
]

const blockFormatButtons = [
  MediumHeadlineButton,
  SmallHeadlineButton,
  ParagraphButton
]

const insertButtons = [
  ImageButton
]

const propertyForms = [
  LinkForm,
  ImageForm,
  CoverForm
]

const Container = ({ children }) => (
  <div {...css(styles.container)}>{ children }</div>
)

const Document = ({ children }) => (
  <div {...css(styles.document)}>{ children }</div>
)

class Editor extends Component {
  constructor (props) {
    super(props)
    this.onChange = (nextState) => {
      const { state, onChange, onDocumentChange } = this.props

      if (state !== nextState) {
        onChange(nextState)
        if (!nextState.document.equals(state.document)) {
          onDocumentChange(nextState.document, nextState)
        }
      }
    }
  }
  render () {
    const { state } = this.props

    return (
      <Container>
        <Sidebar
          textFormatButtons={textFormatButtons}
          blockFormatButtons={blockFormatButtons}
          insertButtons={insertButtons}
          propertyForms={propertyForms}
          state={state}
          onChange={this.onChange} />
        <Document>
          <div {...css(newsletterStyles)}>
            <SlateEditor
              state={state}
              onChange={this.onChange}
              plugins={plugins} />
            <MetaData
              state={state}
              onChange={this.onChange} />
          </div>
        </Document>
      </Container>
    )
  }
}

Editor.propTypes = {
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onDocumentChange: PropTypes.func
}

Editor.defaultProps = {
  onChange: () => true,
  onDocumentChange: () => true
}

export default Editor
