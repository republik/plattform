import React, { Component } from 'react'
import {
  Interaction,
  Label,
  Button,
  Field,
  A
} from '@project-r/styleguide'

import remark from 'remark'
import remarkReactRenderer from 'remark-react'
import TextareaAutosize from 'react-autosize-textarea'

import { swissTime } from '../../../lib/utils/formats'
const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)

export default class Notepad extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notes: props.value,
      message: null
    }
  }

  willReceiveProps(props) {
    this.setState({
      notes: props.value
    })
  }

  renderText(text) {
    return remark()
      .use(remarkReactRenderer, {
        remarkReactComponents: {
          h6: ({ children }) => (
            <Label
              style={{
                display: 'block',
                marginTop: '10px'
              }}
            >
              {children}
            </Label>
          ),
          p: Interaction.P,
          a: A
        }
      })
      .processSync(text).contents
  }

  changeHandler = e => {
    this.setState({ message: e.target.value })
  }

  submitHandler = () => {
    const res = {
      notes: `

  ${this.state.notes}

  ###### ${dateTimeFormat(new Date())}

  ${this.state.message}

  `
    }
    this.setState({ ...res, message: null })
    this.props.onSubmit(res)
  }

  render() {
    return (
      <div>
        <Interaction.H2>Notes</Interaction.H2>
        {this.renderText(this.state.notes || '')}
        <Field
          value={this.state.message}
          label={'Your notes ...'}
          onChange={this.changeHandler}
          renderInput={props => (
            <TextareaAutosize
              {...props}
              style={{ lineHeight: '30px' }}
            />
          )}
        />
        <Button
          primary
          disabled={!this.state.message}
          onClick={this.submitHandler}
        >
          Add note
        </Button>
      </div>
    )
  }
}
