import React, { Component } from 'react'
import { Raw, resetKeyGenerator } from 'slate'
import App from '../lib/App'
import lorem from '../lib/editor/templates/lorem.json'
import Editor from '../components/editor/Editor'
import MarkdownSerializer from '../lib/serializer'
import getRules from '../components/editor/utils/getRules'

const getInitialState = () => {
  resetKeyGenerator()
  return {
    state: Raw.deserialize(lorem, { terse: true })
  }
}

export default class Index extends Component {
  constructor (...args) {
    super(...args)
    this.state = getInitialState()

    this.onDocumentChange = (document, state, plugins) => {
      const serializer = new MarkdownSerializer({
        rules: getRules(plugins)
      })
      try {
        console.log(serializer.serialize(state))
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
