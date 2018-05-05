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
  Radio,
  mediaQueries
} from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'

import { gray2x1 } from '../../utils/placeholder'
import injectBlock from '../../utils/injectBlock'
import {
  buttonStyles
} from '../../utils'
import { tsvParse, csvFormat } from 'd3-dsv'

import { css } from 'glamor'

const previewWidth = 290

const styles = {
  editButton: css({
    position: 'absolute',
    left: -40,
    top: 0,
    zIndex: 1,
    fontSize: 24,
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
  }),
  preview: css({
    [mediaQueries.mUp]: {
      float: 'left',
      width: previewWidth
    }
  }),
  edit: css({
    [mediaQueries.mUp]: {
      float: 'left',
      width: `calc(100% - ${previewWidth}px)`,
      paddingLeft: 20
    }
  })
}

export const EditButton = ({onClick}) => (
  <div {...styles.editButton}
    role='button'
    onClick={onClick}>
    <MdEdit />
  </div>
)

const renderAutoSize = ({onBlur, onPaste} = {}) =>
  ({ref, onBlur: fieldOnBlur, ...inputProps}) => (
    <AutosizeInput {...styles.autoSize}
      {...inputProps}
      onBlur={(e) => {
        onBlur && onBlur(e)
        fieldOnBlur && fieldOnBlur(e)
      }}
      onPaste={onPaste}
      inputRef={ref} />
  )

class JSONField extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      value: undefined
    }
    this.renderInput = renderAutoSize({
      onBlur: (e) => {
        const value = e.target.value
        if (!value) {
          return
        }
        let data
        try {
          data = JSON.parse(value)
        } catch (e) {}
        if (data) {
          this.setState({
            value: undefined
          })
        }
      }
    })
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
        renderInput={this.renderInput}
        onChange={(_, value) => {
          let data
          try {
            data = JSON.parse(value)
          } catch (e) {}
          if (data) {
            onChange(data)
          }

          if (this.state.value !== value) {
            this.setState({value})
          }
        }} />
    )
  }
}

export const EditModal = ({data, onChange, onClose, chart}) => {
  const config = data.get('config') || {}
  return (
    <div onDragStart={e => {
      e.stopPropagation()
    }} onClick={e => {
      e.stopPropagation()
    }}>
      <Overlay onClose={onClose} mUpStyle={{maxWidth: '80vw', marginTop: '5vh'}}>
        <OverlayToolbar>
          <OverlayToolbarClose onClick={onClose} />
        </OverlayToolbar>

        <OverlayBody>
          <div {...styles.preview}>
            {
              (data.get('values') || '').length &&
              Object.keys(config).length
                ? chart
                : <img src={gray2x1} width='100%' />
            }
          </div>
          <div {...styles.edit}>
            <Interaction.P>
              <Label>Size</Label><br />
              {[
                {label: 'Normal', size: undefined},
                {label: 'Klein', size: 'narrow'},
                {label: 'Gross', size: 'breakout'},
                {label: 'Links', size: 'floatTiny'}
              ].map(({label, size}) => {
                const checked = config.size === size
                return (
                  <Radio key={size || label} checked={checked} onChange={() => {
                    if (!checked) {
                      onChange(data.set('config', {...config, size}))
                    }
                  }} style={{marginRight: 15}}>
                    {label || size}
                  </Radio>
                )
              })}
            </Interaction.P>
            <Interaction.P>
              <Label>Typ</Label><br />
              {['Bar', 'TimeBar', 'Lollipop', 'Line', 'Slope'].map(type => {
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
                renderInput={renderAutoSize({
                  onPaste: (e) => {
                    const clipboardData = e.clipboardData || window.clipboardData
                    let parsedTsv
                    try {
                      parsedTsv = tsvParse(clipboardData.getData('Text'))
                    } catch (e) {}
                    if (parsedTsv && parsedTsv.columns.length > 1) {
                      e.preventDefault()
                      onChange(data.set('values', csvFormat(parsedTsv)))
                    }
                  }
                })}
                onChange={(_, value) => {
                  onChange(data.set('values', value))
                }} />
            </Interaction.P>
          </div>
          <br style={{clear: 'both'}} />
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
