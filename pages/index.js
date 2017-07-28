import React, { Component } from 'react'
import { Raw, resetKeyGenerator } from 'slate'

import App from '../lib/App'
import Editor from '../lib/editor/components/Editor'
import lorem from '../lib/editor/templates/lorem'

const getInitialState = () => {
  resetKeyGenerator()
  return {
    state: Raw.deserialize(
      lorem,
      { terse: true }
    )
  }
}

export default class Index extends Component {
  constructor(...args) {
    super(...args)
    this.state = getInitialState()
  }

  commitHandler(state) {
    console.log(state.toJS())
  }

  render() {
    return (
      <App>
        <Editor
          state={this.state.state}
          onCommit={this.commitHandler.bind(this)}
        />
      </App>
    )
  }
}
