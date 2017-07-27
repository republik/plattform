import React, { Component } from 'react'
import { Editor as SlateEditor } from 'slate'
import {
  Button,
  NarrowContainer
} from '@project-r/styleguide'
import Schema from '../schema'
import createMenu from './createMenu'
import createToolbar from './createToolbar'

import FormatBold from 'react-icons/lib/md/format-bold'
import FormatItalic from 'react-icons/lib/md/format-italic'
import FormatUnderlined from 'react-icons/lib/md/format-underlined'
import FormatStrikethrough from 'react-icons/lib/md/format-strikethrough'

const Menu = createMenu([
  ['bold', <FormatBold />],
  ['italic', <FormatItalic />],
  ['underline', <FormatUnderlined />],
  ['strikethrough', <FormatStrikethrough />]
])

const Toolbar = createToolbar([
  ['p', 'p'],
  ['h1', 'h1'],
  ['h2', 'h2'],
  ['lead', 'lead'],
  ['span', 'span'],
  ['label', 'label'],
  ['interaction.p', 'interaction.p']
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
        <Toolbar
          state={this.state.state}
          onChange={this.onChange.bind(this)}
        />
        <NarrowContainer>
          <SlateEditor
            schema={Schema}
            onKeyDown={this.onKeyDown}
            state={this.state.state}
            onChange={this.onChange.bind(this)}
          />
        </NarrowContainer>
      </div>
    )
  }
}
