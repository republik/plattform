import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Editor as SlateEditor } from 'slate'
import { css } from 'glamor'

import { NarrowContainer } from '@project-r/styleguide'

import MarkdownSerializer from '../../lib/serializer'
import getRules from './utils/getRules'

import styles from './styles'
import Sidebar from './Sidebar'

import marks, {
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton
} from './modules/marks'

import title, {
  TitleButton
} from './modules/title'

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

const plugins = [
  ...marks.plugins,
  ...title.plugins,
  ...lead.plugins,
  ...paragraph.plugins,
  ...link.plugins,
  ...image.plugins
]

export const serializer = new MarkdownSerializer({
  rules: getRules(plugins)
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
          <NarrowContainer>
            <SlateEditor
              state={state}
              onChange={this.onChange}
              plugins={plugins} />
          </NarrowContainer>
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
