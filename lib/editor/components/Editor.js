import React, { Component } from 'react'
import { Editor as SlateEditor } from 'slate'
import {
  Button,
  NarrowContainer
} from '@project-r/styleguide'
import Schema from '../schema'
import createMarkToggleMenu from './createMarkToggleMenu'
import createHoverToolbar from './createHoverToolbar'
import createToolbar from './createToolbar'

import FormatBold from 'react-icons/lib/md/format-bold'
import FormatItalic from 'react-icons/lib/md/format-italic'
import FormatUnderlined from 'react-icons/lib/md/format-underlined'
import FormatStrikethrough from 'react-icons/lib/md/format-strikethrough'

const MarkToggleMenu = createMarkToggleMenu([
  ['bold', <FormatBold />],
  ['italic', <FormatItalic />],
  ['underline', <FormatUnderlined />],
  ['strikethrough', <FormatStrikethrough />]
])

const HoverToolbar = createHoverToolbar([MarkToggleMenu])

const Toolbar = createToolbar([
  ['p', 'p'],
  ['h2', 'h2'],
  ['lead', 'lead'],
  ['span', 'span'],
  ['label', 'label'],
  ['blockquote', 'blockquote'],
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
        <HoverToolbar
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
