import React, { Component } from 'react'
import { Raw, resetKeyGenerator } from 'slate'
import App from '../lib/App'
import lorem from '../lib/editor/templates/lorem.json'
import Editor from '../components/editor/Editor'

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
  }

  commitHandler (state, ...args) {
    this.setState({state})
  }

  render () {
    return (
      <App>
        <Editor
          state={this.state.state}
          onChange={this.commitHandler.bind(this)}
        />
      </App>
    )
  }
}
