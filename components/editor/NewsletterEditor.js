import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Editor as SlateEditor } from 'slate-react'
import { css } from 'glamor'

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

import special, {
  SpecialButton, SpecialForm
} from './modules/special'

import createDocumentModule from './modules/document'
import createCoverModule from './modules/cover'
import createCenterModule from './modules/center'

import schema from '../Templates/Newsletter'

const moduleCreators = {
  document: createDocumentModule,
  cover: createCoverModule,
  center: createCenterModule
}
const initModule = rule => {
  const { editorModule } = rule
  if (editorModule) {
    const create = moduleCreators[editorModule]
    if (!create) {
      throw new Error(`Missing editorModule ${editorModule}`)
    }
    const TYPE = editorModule.toUpperCase()
    const subModules = (rule.rules || []).map(initModule).filter(Boolean)
    const module = create({
      rule,
      TYPE,
      subModules: subModules
    })

    module.TYPE = TYPE
    module.subModules = subModules

    return module
  }
}

const rootRule = schema.rules[0]
const rootModule = initModule(rootRule)

const containerStyles = {
  maxWidth: 'calc(100vw - 190px)'
}

export const serializer = rootModule.helpers.serializer
export const newDocument = rootModule.helpers.newDocument

const getFromModules = (module, accessor) =>
  (accessor(module) || [])
  .concat(
    (module.subModules || []).reduce(
      (collector, subModule) => collector.concat(
        getFromModules(subModule, accessor)
      ),
      []
    )
  )

const plugins = getFromModules(rootModule, m => m.plugins)
  .concat([
    ...marks.plugins,
    ...headlines.plugins,
    ...lead.plugins,
    ...paragraph.plugins,
    ...link.plugins,
    ...figure.plugins,
    ...blockquote.plugins,
    ...list.plugins,
    ...special.plugins
  ])

const textFormatButtons = getFromModules(
  rootModule,
  m => m.ui && m.ui.textFormatButtons
).concat([
  BoldButton,
  ItalicButton,
  LinkButton
])

const blockFormatButtons = getFromModules(
  rootModule,
  m => m.ui && m.ui.blockFormatButtons
).concat([
  MediumHeadlineButton,
  SmallHeadlineButton,
  ParagraphButton,
  BlockquoteButton,
  ULButton,
  OLButton
])

const insertButtons = getFromModules(
  rootModule,
  m => m.ui && m.ui.insertButtons
).concat([
  FigureButton,
  SpecialButton
])

const propertyForms = getFromModules(
  rootModule,
  m => m.ui && m.ui.forms
).concat([
  LinkForm,
  FigureForm,
  SpecialForm
])

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
          <div {...css(containerStyles)}>
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
