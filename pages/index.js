import React, { Component } from 'react'
import { Raw, resetKeyGenerator } from 'slate'
import App from '../lib/App'
import lorem from '../lib/editor/templates/lorem.json'
import Editor, {getPlugins} from '../components/editor/Editor'
import MarkdownSerializer from '../lib/serializer'
import getRules from '../components/editor/utils/getRules'

const getInitialState = (serializer) => {
  resetKeyGenerator()
  return {
    state: Raw.deserialize(lorem, { terse: true })
    // state: serializer.deserialize('# Lorem ipsum')
  }
}

export default class Index extends Component {
  constructor (...args) {
    super(...args)
    const documentType = null
    this.serializer = new MarkdownSerializer({
      rules: getRules(getPlugins(documentType))
    })
    this.state = getInitialState(this.serializer)

    this.onDocumentChange = (document, state) => {
      try {
        console.log(this.serializer.serialize(state))
      } catch (e) {}
    }
  }

  render () {
    return (
      <App>
        <Editor
          state={this.state.state}
          onChange={state => this.setState({state})}
          onDocumentChange={this.onDocumentChange}
        />
      </App>
    )
  }
}
