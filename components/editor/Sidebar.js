import React from 'react'
import { css } from 'glamor'

import { Interaction, Label, colors } from '@project-r/styleguide'
import { HEADER_HEIGHT, ZINDEX_SIDEBAR } from '../Frame/constants'

const styles = {
  sidebar: css({
    position: 'fixed',
    zIndex: ZINDEX_SIDEBAR,
    backgroundColor: '#fff',
    top: HEADER_HEIGHT,
    left: 0,
    bottom: 0,
    width: 170,
    overflow: 'auto',
    padding: '0 7px 10px',
    borderRight: `1px solid ${colors.divider}`
  })
}

const Sidebar = ({
  textFormatButtons,
  blockFormatButtons,
  insertButtons,
  propertyForms,
  value, onChange
}) => (
  <div {...css(styles.sidebar)}>
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
    <div style={{marginTop: 20}}>
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

export default Sidebar
