import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Editor as SlateEditor } from 'slate'
import { css } from 'glamor'
import BasicDocument, {plugins} from './BasicDocument'
import styles from './styles'

const getUI = documentType => {
  switch (documentType) {
    default:
      return BasicDocument
  }
}
export const getPlugins = documentType => {
  switch (documentType) {
    default:
      return plugins
  }
}

const Container = ({ children }) => (
  <div {...css(styles.container)}>{ children }</div>
)

const Sidebar = ({ children }) => (
  <div {...css(styles.sidebar)}>{ children }</div>
)

const Document = ({ children }) => (
  <div {...css(styles.document)}>{ children }</div>
)

class Editor extends Component {
  constructor (props) {
    super(props)
    this.changeHandler = this.changeHandler.bind(this)
  }

  changeHandler (nextState) {
    const { state, onChange, onDocumentChange } = this.props

    if (state !== nextState) {
      onChange(nextState)
      if (state.document !== nextState.document) {
        onDocumentChange(nextState.document, nextState)
      }
    }
  }

  render () {
    const { state } = this.props
    const UI = getUI(state.getIn(['document', 'data', 'documentType']))
    const props = {
      onChange: this.changeHandler,
      Editor: SlateEditor,
      Container,
      Sidebar,
      Document,
      state
    }
    return (
      <UI {...props} />
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
