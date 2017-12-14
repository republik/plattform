import React, { Component } from 'react'
import { initModule, getAllModules, getFromModules } from './'
import { Interaction, Label, colors } from '@project-r/styleguide'

const Sidebar = ({
  textFormatButtons,
  blockFormatButtons,
  insertButtons,
  propertyForms,
  value, onChange
}) => (
  <div>
    <Interaction.P>
      <Label>Text</Label>
      <br />
      {textFormatButtons.map((Button, i) => (
        <Button
          key={`text-fmt-${i}`}
          value={value}
          onChange={onChange}
          />
        ))
      }
    </Interaction.P>
    <Interaction.P>
      <Label>Block</Label>
      {
        blockFormatButtons.map((Button, i) => (
          <Button
            key={`block-fmt-${i}`}
            value={value}
            onChange={onChange}
          />
        ))
      }
    </Interaction.P>
    <Interaction.P>
      <Label>Einfügen</Label>
      {
        insertButtons.map((Button, i) => (
          <Button
            key={`insert-${i}`}
            value={value}
            onChange={onChange}
          />
        ))
      }
    </Interaction.P>
    <div style={{marginTop: 10, paddingTop: 20, borderTop: `1px solid ${colors.divider}`}}>
      {
        propertyForms.map((Form, i) => (
          <Form
            key={`form-${i}`}
            value={value}
            onChange={onChange}
            />
        ))
      }
    </div>
  </div>
)

export default class extends Component {
  constructor (props, ...args) {
    super(props, ...args)

    const rootRule = props.schema.rules[0]
    const rootModule = initModule(rootRule)

    const allModules = getAllModules(rootModule)
    const uniqModules = allModules.filter((m, i, a) => a.findIndex(mm => mm.TYPE === m.TYPE) === i)

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

    this.propertyForms = getFromModules(
      uniqModules,
      m => m.ui && m.ui.forms
    )
  }

  render () {
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
        onChange={this.props.onChange} />
    )
  }
}
