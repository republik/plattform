import React, { Component } from 'react'
import { Raw, resetKeyGenerator } from 'slate'

import App from '../app/App'
import Editor from '../app/editor/components/Editor'

const getInitialState = () => {
  resetKeyGenerator()
  return {
    state: Raw.deserialize(
      {
        nodes: [
          {
            kind: 'block',
            type: 'interaction.p',
            nodes: [
              {
                kind: 'block',
                type: 'label',
                nodes: [
                  {
                    kind: 'text',
                    text: 'A fixed label.'
                  }
                ]
              },
              {
                kind: 'block',
                type: 'span',
                nodes: [
                  {
                    kind: 'text',
                    text:
                      'A line in an interaction paragraph.'
                  }
                ]
              }
            ]
          }
        ]
      },
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
