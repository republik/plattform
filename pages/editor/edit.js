import React, { Component } from 'react'
import withData from '../../lib/apollo/withData'
import { Raw, resetKeyGenerator } from 'slate'
import App from '../../lib/App'
import lorem from '../../lib/editor/templates/lorem.json'
import Editor from '../../lib/editor/components/Editor'
import EditorFrame from '../../lib/components/EditorFrame'
import withAuthorization from '../../components/Auth/withAuthorization'

const getInitialState = () => {
  resetKeyGenerator()
  return {
    state: Raw.deserialize(lorem, { terse: true })
  }
}

class EditorPage extends Component {
  constructor (...args) {
    super(...args)
    this.state = getInitialState()
  }

  commitHandler (state, ...args) {
    this.setState({ state })
  }

  render () {
    const { repository, commit } = this.props.url.query
    return (
      <App>
        <EditorFrame view={'edit'} repository={repository} commit={commit}>
          <Editor
            state={this.state.state}
            onChange={this.commitHandler.bind(this)}
          />
        </EditorFrame>
      </App>
    )
  }
}

export default withData(withAuthorization(['editor'])(EditorPage))
