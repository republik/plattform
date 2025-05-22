import { Component } from 'react'
import { getFromModules } from './'
import { Interaction, Label, colors } from '@project-r/styleguide'
import PropTypes from 'prop-types'

const Sidebar = ({
  textFormatButtons,
  blockFormatButtons,
  insertButtons,
  propertyForms,
  value,
  onChange,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 110px)',
      overflow: 'hidden',
    }}
  >
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <Label>Text</Label>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        {textFormatButtons.map((Button, i) => (
          <Button key={`text-fmt-${i}`} value={value} onChange={onChange} />
        ))}
      </div>
      <Label>Block</Label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '10px',
        }}
      >
        {' '}
        {blockFormatButtons.map((Button, i) => (
          <Button key={`block-fmt-${i}`} value={value} onChange={onChange} />
        ))}
      </div>
      <Label>Einfügen</Label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '10px',
        }}
      >
        {' '}
        <Label>Einfügen</Label>
        {insertButtons.map((Button, i) => (
          <Button key={`insert-${i}`} value={value} onChange={onChange} />
        ))}
      </div>
    </div>
    <div
      style={{
        flex: 1,
        padding: '20px 10px',
        backgroundColor: 'white',
        width: '100%',
        borderTop: `1px solid ${colors.divider}`,
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
      (m) => m.ui && m.ui.textFormatButtons,
    )

    this.blockFormatButtons = getFromModules(
      uniqModules,
      (m) => m.ui && m.ui.blockFormatButtons,
    )

    this.insertButtons = getFromModules(
      uniqModules,
      (m) => m.ui && m.ui.insertButtons,
    )

    this.propertyForms = getFromModules(uniqModules, (m) => m.ui && m.ui.forms)
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
      change: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}

export default UISidebar
