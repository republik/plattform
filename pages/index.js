import React, { Component } from 'react'
import { Editor, Raw, resetKeyGenerator } from 'slate'

import App from '../app/App'
import Schema from '../app/editor/schema'

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

  onChange(selection, state) {
    console.log(state.startOffset)
    this.setState(() => ({
      state
    }))
  }

  render() {
    return (
      <App>
        <Editor
          schema={Schema}
          onKeyDown={this.onKeyDown}
          state={this.state.state}
          onSelectionChange={this.onChange.bind(this)}
        />
      </App>
    )
  }
}
