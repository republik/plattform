import React, { Component } from 'react'
import { Editor as SlateEditor } from 'slate'
import { Button } from '@project-r/styleguide'
import Schema from '../schema'

export default class Editor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      state: props.state
    }
  }

  onChange(selection, state) {
    this.setState(() => ({
      state
    }))
  }

  render() {
    return (
      <div>
        <Button
          primary
          onClick={() =>
            this.props.onCommit(this.state.state)}
        >
          Commit
        </Button>
        <SlateEditor
          schema={Schema}
          onKeyDown={this.onKeyDown}
          state={this.state.state}
          onSelectionChange={this.onChange.bind(this)}
        />
      </div>
    )
  }
}
