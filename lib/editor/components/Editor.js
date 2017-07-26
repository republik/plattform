import React, { Component } from 'react'
import { Editor as SlateEditor } from 'slate'
import { Button } from '@project-r/styleguide'
import Schema from '../schema'
import createMenu from './createMenu'

const Menu = createMenu([
  ['bold', 'b'],
  ['italic', 'i'],
  ['underline', 'u'],
  ['strikethrough', 's']
])

export default class Editor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      state: props.state
    }
  }

  onChange(state) {
    this.setState(() => ({
      state
    }))
  }

  willReceiveProps(nextProps) {
    this.setState({ state: nextProps.state })
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
        <Menu
          state={this.state.state}
          onChange={this.onChange.bind(this)}
        />
        <SlateEditor
          schema={Schema}
          onKeyDown={this.onKeyDown}
          state={this.state.state}
          onChange={this.onChange.bind(this)}
        />
      </div>
    )
  }
}
