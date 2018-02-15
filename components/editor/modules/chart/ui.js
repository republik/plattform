import React, { Component } from 'react'
import MdEdit from 'react-icons/lib/md/edit'
import {
  Overlay,
  OverlayToolbar,
  OverlayToolbarClose,
  OverlayBody,
  Interaction,
  Label,
  Field,
  Radio
} from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'

import injectBlock from '../../utils/injectBlock'
import {
  buttonStyles
} from '../../utils'

import { css } from 'glamor'

const styles = {
  editButton: css({
    float: 'right',
    fontSize: 24,
    position: 'relative',
    zIndex: 1,
    ':hover': {
      cursor: 'pointer'
    }
  }),
  autoSize: css({
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  })
}

export const EditButton = ({onClick}) => (
  <div {...styles.editButton}
    role='button'
    contentEditable={false}
    onClick={onClick}>
    <MdEdit />
  </div>
)

const renderAutoSize = ({ref, ...inputProps}) => (
  <AutosizeInput {...styles.autoSize}
    {...inputProps}
    inputRef={ref} />
)

class JSONField extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      value: undefined
    }
  }
  render () {
    const { label, value, onChange } = this.props
    const stateValue = this.state.value
    return (
      <Field
        label={label}
        value={stateValue === undefined
          ? JSON.stringify(value, null, 2)
          : stateValue}
        renderInput={renderAutoSize}
        onChange={(_, value) => {
          this.setState({
            value
          }, () => {
            let data
            try {
              data = JSON.parse(value)
            } catch (e) {}
            if (data) {
              onChange(data)
              this.setState({
                value: undefined
              })
            }
          })
        }} />
    )
  }
}

export const EditModal = ({data, onChange, onClose}) => {
  const config = data.get('config') || {}
  return (
    <div onClick={e => {
      e.stopPropagation()
    }}>
      <Overlay onClose={onClose} mUpStyle={{maxWidth: '80vw', marginTop: '5vh'}}>
        <OverlayToolbar>
          <OverlayToolbarClose onClick={onClose} />
        </OverlayToolbar>

        <OverlayBody>
          <Interaction.P>
            <Label>Typ</Label><br />
            {['Bar', 'Lollipop', 'Line', 'Slope'].map(type => {
              const checked = config.type === type
              return (
                <Radio key={type} checked={checked} onChange={() => {
                  if (!checked) {
                    onChange(data.set('config', {...config, type}))
                  }
                }} style={{marginRight: 15}}>
                  {type}
                </Radio>
              )
            })}
          </Interaction.P>
          <Interaction.P>
            <JSONField
              label='JSON Config'
              value={config}
              onChange={(value) => {
                onChange(data.set('config', value))
              }} />
          </Interaction.P>
          <Interaction.P>
            <Field
              label='CSV Data'
              name='values'
              value={data.get('values')}
              renderInput={renderAutoSize}
              onChange={(_, value) => {
                onChange(data.set('values', value))
              }} />
          </Interaction.P>
        </OverlayBody>
      </Overlay>
    </div>
  )
}

export default ({TYPE, CANVAS_TYPE, newBlock, editorOptions}) => {
  const {
    insertButtonText,
    insertTypes = []
  } = editorOptions || {}

  const insertHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    if (!disabled) {
      return onChange(
        value
          .change()
          .call(
            injectBlock,
            newBlock()
          )
      )
    }
  }
  const InsertButton = ({ value, onChange }) => {
    const disabled = value.isBlurred || !value.blocks.every(
      n => insertTypes.includes(n.type)
    )

    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={insertHandler(disabled, value, onChange)}
        >
        {insertButtonText}
      </span>
    )
  }

  return {
    insertButtons: [insertButtonText && InsertButton]
  }
}
