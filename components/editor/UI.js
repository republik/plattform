import React, { Component } from 'react'
import { getFromModules } from './'
import { Interaction, Label, colors } from '@project-r/styleguide'
import PropTypes from 'prop-types'

const Sidebar = ({
  textFormatButtons,
  blockFormatButtons,
  insertButtons,
  propertyForms,
  value,
  onChange
}) => (
  <div>
    <Interaction.P>
      <Label>Text</Label>
      <br />
      {textFormatButtons.map((Button, i) => (
        <Button key={`text-fmt-${i}`} value={value} onChange={onChange} />
      ))}
    </Interaction.P>
    <Interaction.P>
      <Label>Block</Label>
      {blockFormatButtons.map((Button, i) => (
        <Button key={`block-fmt-${i}`} value={value} onChange={onChange} />
      ))}
    </Interaction.P>
    <Interaction.P>
      <Label>Einfügen</Label>
      {insertButtons.map((Button, i) => (
        <Button key={`insert-${i}`} value={value} onChange={onChange} />
      ))}
    </Interaction.P>
    <div
      style={{
        marginTop: 10,
        paddingTop: 20,
        borderTop: `1px solid ${colors.divider}`
      }}
    >
      {propertyForms.map((Form, i) => (
        <Form key={`form-${i}`} value={value} onChange={onChange} />
      ))}
    </div>
  </div>
)

class UISidebar extends Component {
  constructor(props, ...args) {
    super(props, ...args)

    const { uniqModules } = props.editorRef

    this.textFormatButtons = getFromModules(
      uniqModules,
      m => m.ui && m.ui.textFormatButtons
    )

    this.blockFormatButtons = getFromModules(
      uniqModules,
      m => m.ui && m.ui.blockFormatButtons
    )

    this.insertButtons = getFromModules(
      uniqModules,
      m => m.ui && m.ui.insertButtons
    )

    this.propertyForms = getFromModules(uniqModules, m => m.ui && m.ui.forms)
  }

  render() {
    if (!this.props.value) {
      return null
    }
    return (
      <Sidebar
        textFormatButtons={this.textFormatButtons}
        blockFormatButtons={this.blockFormatButtons}
        insertButtons={this.insertButtons}
        propertyForms={this.propertyForms}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    )
  }
}

UISidebar.propTypes = {
  editorRef: PropTypes.shape({
    uniqModules: PropTypes.array.isRequired,
    slate: PropTypes.shape({
      change: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
}

export default UISidebar
