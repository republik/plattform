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
import createCoverModule, { CoverForm } from './modules/cover'
import createCenterModule from './modules/center'

const newsletterStyles = {
  fontFamily: 'serif',
  fontSize: 18,
  color: '#444',
  WebkitFontSmoothing: 'antialiased',
  maxWidth: 'calc(100vw - 190px)'
}

const coverModule = createCoverModule({
  TYPE: 'COVER',
  subModules: []
})
const centerModule = createCenterModule({
  TYPE: 'CENTER',
  subModules: []
})

const documentModule = createDocumentModule({
  TYPE: 'document',
  subModules: [
    coverModule,
    centerModule
  ]
})

export const serializer = documentModule.helpers.serializer
export const newDocument = documentModule.helpers.newDocument

const plugins = [
  ...documentModule.plugins,
  ...centerModule.plugins,
  ...coverModule.plugins,
  ...marks.plugins,
  ...headlines.plugins,
  ...lead.plugins,
  ...paragraph.plugins,
  ...link.plugins,
  ...figure.plugins,
  ...blockquote.plugins,
  ...list.plugins,
  ...special.plugins
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
  FigureButton,
  SpecialButton
]

const propertyForms = [
  LinkForm,
  FigureForm,
  CoverForm,
  SpecialForm
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
