import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Editor as SlateEditor } from 'slate-react'
import { css } from 'glamor'
import { DragDropContextProvider } from 'react-dnd'

import slateReactDnDAdapter from './utils/slateReactDnDAdapter'

import Loader from '../Loader'

import Sidebar from './Sidebar'

import createDocumentModule from './modules/document'
import createDocumentPlainModule from './modules/document/plain'
import createCoverModule from './modules/cover'
import createCenterModule from './modules/center'
import createHeadlineModule from './modules/headline'
import createParagraphModule from './modules/paragraph'
import createBlockquoteModule from './modules/blockquote'
import createLinkModule from './modules/link'
import createMarkModule from './modules/mark'
import createListModule from './modules/list'
import createListItemModule from './modules/list/item'
import createFigureModule from './modules/figure'
import createFigureImageModule from './modules/figure/image'
import {
  createEmbedVideoModule,
  createEmbedTwitterModule
} from './modules/embed'
import createSpecialModule from './modules/special'
import createMetaModule from './modules/meta'
import createSpecialCharsModule from './modules/specialchars'
import createBlockModule from './modules/block'
import createTitleModule from './modules/title'
import createInfoBoxModule from './modules/infobox'

const {
  ReactDnDPlugin,
  SlateHTML5Backend
} = slateReactDnDAdapter()

const moduleCreators = {
  embedVideo: createEmbedVideoModule,
  embedTwitter: createEmbedTwitterModule,
  document: createDocumentModule,
  documentPlain: createDocumentPlainModule,
  cover: createCoverModule,
  center: createCenterModule,
  headline: createHeadlineModule,
  paragraph: createParagraphModule,
  link: createLinkModule,
  mark: createMarkModule,
  blockquote: createBlockquoteModule,
  list: createListModule,
  listItem: createListItemModule,
  figure: createFigureModule,
  figureImage: createFigureImageModule,
  special: createSpecialModule,
  meta: createMetaModule,
  specialchars: createSpecialCharsModule,
  block: createBlockModule,
  title: createTitleModule,
  infobox: createInfoBoxModule
}
const initModule = rule => {
  const { editorModule, editorOptions = {} } = rule
  if (editorModule) {
    const create = moduleCreators[editorModule]
    if (!create) {
      throw new Error(`Missing editorModule ${editorModule}`)
    }
    const TYPE = (editorOptions.type || editorModule).toUpperCase()
    const subModules = (rule.rules || [])
      .map(initModule)
      .filter(Boolean)
    const module = create({
      TYPE,
      rule,
      subModules: subModules
    })

    module.TYPE = TYPE
    module.name = editorModule
    module.subModules = subModules

    return module
  }
}
const getAllModules = module => [module].concat(
  (module.subModules || []).reduce(
    (collector, subModule) => collector.concat(
      getAllModules(subModule)
    ),
    []
  )
)
const getFromModules = (modules, accessor) => modules.reduce(
  (collector, m) => collector.concat(accessor(m)),
  []
).filter(Boolean)

const styles = {
  container: css({
    width: '100%',
    paddingLeft: 170,
    position: 'relative'
  }),
  document: {
    width: '100%'
  }
}

const Container = ({ children }) => (
  <div {...styles.container}>{ children }</div>
)

const Document = ({ children }) => (
  <div {...styles.document}>{ children }</div>
)

class Editor extends Component {
  constructor (props) {
    super(props)
    this.onChange = (change) => {
      const { value, onChange, onDocumentChange } = this.props

      if (change.value !== value) {
        onChange(change)
        if (!change.value.document.equals(value.document)) {
          onDocumentChange(change.value.document, change)
        }
      }
    }

    const schema = props.schema
    if (!schema) {
      throw new Error('missing schema prop')
    }
    const rootRule = schema.rules[0]
    const rootModule = initModule(rootRule)

    this.serializer = rootModule.helpers.serializer
    this.newDocument = rootModule.helpers.newDocument

    const allModules = getAllModules(rootModule)
    const uniqModules = allModules.filter((m, i, a) => a.findIndex(mm => mm.TYPE === m.TYPE) === i)

    this.plugins = [
      ...getFromModules(uniqModules, m => m.plugins),
      ReactDnDPlugin
    ]

    this.textFormatButtons = getFromModules(
      uniqModules,
      m => m.ui && m.ui.textFormatButtons
    )

    this.blockFormatButtons = getFromModules(
      uniqModules,
      m => m.ui && m.ui.blockFormatButtons
    )

    this.insertButtons = getFromModules(
      uniqModules,
      m => m.ui && m.ui.insertButtons
    )

    this.propertyForms = getFromModules(
      uniqModules,
      m => m.ui && m.ui.forms
    )
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.schema !== this.props.schema) {
      throw new Error('changing schema is not supported')
    }
  }
  render () {
    const { value } = this.props

    return (
      <Loader loading={!value} render={() => (
        <DragDropContextProvider backend={SlateHTML5Backend}>
          <Container>
            <Sidebar
              textFormatButtons={this.textFormatButtons}
              blockFormatButtons={this.blockFormatButtons}
              insertButtons={this.insertButtons}
              propertyForms={this.propertyForms}
              value={value}
              onChange={this.onChange} />
            <Document>
              <SlateEditor
                value={value}
                onChange={this.onChange}
                plugins={this.plugins} />
            </Document>
          </Container>
        </DragDropContextProvider>
      )} />
    )
  }
}

Editor.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onDocumentChange: PropTypes.func
}

Editor.defaultProps = {
  onChange: () => true,
  onDocumentChange: () => true
}

export default Editor
