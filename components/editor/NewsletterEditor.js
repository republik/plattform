import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Editor as SlateEditor } from 'slate'
import { css } from 'glamor'

import MarkdownSerializer from '../../lib/serializer'
import {getSerializationRules} from './utils/getRules'

import styles from './styles'
import Sidebar from './Sidebar'

import marks, {
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton
} from './modules/marks'

import headlines, {
  TitleButton
} from './modules/headlines'

import lead, {
  LeadButton
} from './modules/lead'

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

import cover from './modules/cover'

const newsletterStyles = {
  fontFamily: 'serif',
  fontSize: 18,
  color: '#444',
  WebkitFontSmoothing: 'antialiased',
  maxWidth: 'calc(100vw - 190px)'

}

const plugins = [
  ...marks.plugins,
  ...headlines.plugins,
  ...lead.plugins,
  ...paragraph.plugins,
  ...link.plugins,
  ...image.plugins,
  ...cover.plugins
]

export const serializer = new MarkdownSerializer({
  rules: getSerializationRules(plugins)
})

const textFormatButtons = [
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton,
  LinkButton
]

const blockFormatButtons = [
  TitleButton,
  LeadButton,
  ParagraphButton
]

const insertButtons = [
  ImageButton
]

const propertyForms = [
  LinkForm,
  ImageForm
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
        if (state.document !== nextState.document) {
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
