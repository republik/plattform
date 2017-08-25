import React, { Component } from 'react'
import { Raw, resetKeyGenerator } from 'slate'
import App from '../lib/App'
import lorem from '../lib/editor/templates/lorem.json'
import Editor, {serializer} from '../components/editor/NewsletterEditor'

const getInitialState = () => {
  resetKeyGenerator()
  return {
    state: Raw.deserialize(lorem, { terse: true })
    // state: serializer.deserialize('# Lorem ipsum')
  }
}

export default class Index extends Component {
  constructor (...args) {
    super(...args)
    this.state = getInitialState()

    this.onDocumentChange = (document, state) => {
      try {
        console.log(serializer.serialize(state))
      } catch (e) {
        console.error(e)
      }
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
