import React, { Component } from 'react'
import { Editor as SlateEditor, Raw } from 'slate'
import {
  Container,
  NarrowContainer,
  R,
  Button,
  Interaction,
  colors
} from '@project-r/styleguide'
import config from '../config'
import Typography from '../modules/typography'
import Document from '../modules/document'
import Link from '../modules/link'
import Image from '../modules/image'

const { /* Modules, */ Plugins, Schema } = config({
  Typography,
  Document,
  Link,
  Image
})()

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
    if (this.props.onChange) {
      this.props.onChange(state)
    }
  }

  componentWillReceiveProps (nextProps) {
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
            Commit
          </Button>
        </Container>
        <NarrowContainer>
          <SlateEditor
            schema={Schema}
            plugins={Plugins}
            state={state}
            onChange={this.onChange}
          />
        </NarrowContainer>
      </div>
    )
  }
}
