import React from 'react'
import { css } from 'glamor'

import { Interaction, Label } from '@project-r/styleguide'
import styles from './styles'

const Sidebar = ({
  textFormatButtons,
  blockFormatButtons,
  insertButtons,
  propertyForms,
  state, onChange
}) => (
  <div {...css(styles.sidebar)}>
    <Interaction.P>
      <Label>Format Text</Label>
      <br />
      {textFormatButtons.map((Button, i) => (
        <Button
          key={`text-fmt-${i}`}
          state={state}
          onChange={onChange}
          />
        ))
      }
    </Interaction.P>
    <Interaction.P>
      <Label>Format Block</Label>
      {
        blockFormatButtons.map((Button, i) => (
          <Button
            key={`block-fmt-${i}`}
            state={state}
            onChange={onChange}
          />
        ))
      }
    </Interaction.P>
    <Interaction.P>
      <Label>Insert</Label>
      {
        insertButtons.map((Button, i) => (
          <Button
            key={`insert-${i}`}
            state={state}
            onChange={onChange}
          />
        ))
      }
    </Interaction.P>
    <div style={{marginTop: 20}}>
      {
        propertyForms.map((Form, i) => (
          <Form
            key={`form-${i}`}
            state={state}
            onChange={onChange}
            />
        ))
      }
    </div>
  </div>
)

export default Sidebar
