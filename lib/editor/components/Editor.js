import React, { Component } from 'react'
import { Editor as SlateEditor, Raw } from 'slate'
import {
  Button,
  Container,
  NarrowContainer,
  R,
  Interaction,
  colors
} from '@project-r/styleguide'
import Schema from '../schema'
import MarkMenu from './MarkMenu'
import BlockMenu from './BlockMenu'
import LinkMenu from './LinkMenu'
import HoverToolbar from './HoverToolbar'
import SideToolbar from './SideToolbar'

import FormatBold from 'react-icons/lib/md/format-bold'
import FormatItalic from 'react-icons/lib/md/format-italic'
import FormatUnderlined from 'react-icons/lib/md/format-underlined'
import FormatStrikethrough from 'react-icons/lib/md/format-strikethrough'

const marks = [
  ['bold', <FormatBold />],
  ['italic', <FormatItalic />],
  ['underline', <FormatUnderlined />],
  ['strikethrough', <FormatStrikethrough />]
]

const blocks = [
  ['p', 'p'],
  ['h2', 'h2'],
  ['lead', 'lead'],
  ['label', 'label'],
  ['blockquote', 'blockquote'],
  ['interaction.p', 'interaction.p']
]

export default class Editor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      state: props.state
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange(state) {
    console.log(Raw.serialize(state, { terse: true }))
    this.setState(() => ({
      state
    }))
  }

  willReceiveProps(nextProps) {
    this.setState({ state: nextProps.state })
  }

  render() {
    const { state } = this.state
    return (
      <div>
        <Container
          style={{
            display: 'flex',
            flexFlow: 'row no-wrap',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.divider}`
          }}
        >
          <span
            style={{
              display: 'block',
              width: '40px'
            }}
          >
            <R />
          </span>
          <Interaction.H1>Haku</Interaction.H1>
          <Button
            primary
            onClick={() => this.props.onCommit(state)}
          >
            <FormatBold />
          </Button>
        </Container>
        <HoverToolbar state={state}>
          <MarkMenu
            marks={marks}
            state={state}
            onChange={this.onChange}
          />
          <LinkMenu
            state={state}
            onChange={this.onChange}
          />
        </HoverToolbar>
        <SideToolbar state={state}>
          <BlockMenu
            blocks={blocks}
            state={state}
            onChange={this.onChange}
          />
        </SideToolbar>
        <NarrowContainer>
          <SlateEditor
            schema={Schema}
            state={state}
            onChange={this.onChange}
          />
        </NarrowContainer>
      </div>
    )
  }
}
