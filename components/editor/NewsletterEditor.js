import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Document as SlateDocument } from 'slate'
import { Editor as SlateEditor } from 'slate-react'
import { css } from 'glamor'

import MarkdownSerializer from '../../lib/serializer'
import addValidation, { findOrCreate } from './utils/serializationValidation'
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

import blockquote, {
  BlockquoteButton
} from './modules/blockquote'

import link, {
  LinkButton,
  LinkForm
} from './modules/link'

import list, {
  ULButton,
  OLButton
} from './modules/list'

import figure, {
  FigureForm,
  FigureButton
} from './modules/figure'

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

const documentRule = {
  match: object => object.kind === 'document',
  matchMdast: node => node.type === 'root',
  fromMdast: (node, index, parent, visitChildren) => {
    const cover = findOrCreate(node.children, {
      type: 'zone', identifier: COVER
    }, {
      children: []
    })

    let center = findOrCreate(node.children, {
      type: 'zone', identifier: CENTER
    }, {
      children: []
    })

    const centerIndex = node.children.indexOf(center)
    const before = []
    const after = []
    node.children.forEach((child, index) => {
      if (child !== cover && child !== center) {
        if (index > centerIndex) {
          after.push(child)
        } else {
          before.push(child)
        }
      }
    })
    if (before.length || after.length) {
      center = {
        ...center,
        children: [
          ...before,
          ...center.children,
          ...after
        ]
      }
    }

    const documentNode = {
      data: node.meta,
      kind: 'document',
      nodes: [
        coverSerializer.fromMdast(cover),
        centerSerializer.fromMdast(center)
      ]
    }

    const newData = autoMeta(
      SlateDocument.fromJSON(documentNode)
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
    const center = findOrCreate(
      object.nodes,
      { kind: 'block', type: CENTER },
      { nodes: [] }
    )
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

export const newDocument = ({title}) => serializer.deserialize(
`<section><h6>${COVER}</h6>

# ${title}

<hr/></section>

<section><h6>${CENTER}</h6>

Ladies and Gentlemen,

<hr/></section>
`)

addValidation(documentRule, serializer, 'document')

const documentPlugin = {
  schema: {
    rules: [
      documentRule
    ]
  },
  onBeforeChange: (change) => {
    const newData = autoMeta(change.state.document)

    if (newData) {
      change.setNodeByKey(change.state.document.key, {
        data: newData
      })
      return change
    }
  }
}

const plugins = [
  documentPlugin,
  ...marks.plugins,
  ...headlines.plugins,
  ...lead.plugins,
  ...paragraph.plugins,
  ...link.plugins,
  ...figure.plugins,
  ...cover.plugins,
  ...center.plugins,
  ...blockquote.plugins,
  ...list.plugins
]

const textFormatButtons = [
  BoldButton,
  ItalicButton,
  LinkButton
]

const blockFormatButtons = [
  MediumHeadlineButton,
  SmallHeadlineButton,
  ParagraphButton,
  BlockquoteButton,
  ULButton,
  OLButton
]

const insertButtons = [
  FigureButton
]

const propertyForms = [
  LinkForm,
  FigureForm,
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
    this.onChange = (change) => {
      const { state, onChange, onDocumentChange } = this.props

      if (change.state !== state) {
        onChange(change)
        if (!change.state.document.equals(state.document)) {
          onDocumentChange(change.state.document, change)
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
