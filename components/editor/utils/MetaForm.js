import React, { Component } from 'react'
import { css } from 'glamor'
import { Map } from 'immutable'

import {
  A,
  Field,
  Checkbox,
  Label,
  Interaction,
  Dropdown
} from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'
import MaskedInput from 'react-maskedinput'

import { timeParse, timeFormat } from 'd3-time-format'

import RepoSelect from '../modules/meta/RepoSelect'
import withT from '../../../lib/withT'

import ImageInput from './ImageInput'

const dateFormat = '%d.%m.%Y %H:%M'
const dateMask = dateFormat.replace('%Y', '1111').replace(/%(d|m|H|M)/g, '11')
const parseDate = timeParse(dateFormat)
const formatDate = timeFormat(dateFormat)

const defaultGetWidth = () => '100%'

const GUTTER = 20
const styles = {
  grid: css({
    clear: 'both',
    width: `calc(100% + ${GUTTER}px)`,
    margin: `0 -${GUTTER / 2}px`,
    ':after': {
      content: '""',
      display: 'table',
      clear: 'both'
    }
  }),
  span: css({
    float: 'left',
    paddingLeft: `${GUTTER / 2}px`,
    paddingRight: `${GUTTER / 2}px`,
    minHeight: 1,
    width: '50%'
  }),
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  }),
  mask: css({
    '::placeholder': {
      color: 'transparent'
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc'
      }
    }
  })
}

class Form extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { data } = this.props
    const { data: nextData } = nextProps
    if (!nextData.equals(data)) {
      const { state } = this
      const nextState = {}
      nextData.map((value, key) => {
        const stateValue = state[key]
        if (stateValue && stateValue.value !== value) {
          nextState[key] = undefined
        }
      })
      this.setState(nextState)
    }
  }
  render() {
    const {
      t,
      onInputChange,
      data,
      notes = Map(),
      customFields = [],
      getWidth = defaultGetWidth,
      black
    } = this.props

    return (
      <div {...styles.grid}>
        {data
          .map((value, key) => {
            let input
            let formattedValue = value
            let onChange
            const customField = customFields.find(f => f.key === key) || {}

            const label =
              customField.label || t(`metaData/field/${key}`, undefined, key)

            if (customField.ref === 'repoIds') {
              const values =
                typeof value === 'string' // legacy csv repo ids
                  ? value.split(',').filter(Boolean)
                  : value || []
              const lastValueEmpty =
                values.length > 0 && !values[values.length - 1]

              input = (
                <div style={{ marginBottom: 20 }}>
                  <Interaction.H3>{label}</Interaction.H3>
                  {values.map((v, i) => {
                    return (
                      <RepoSelect
                        key={`${key}-${i}`}
                        value={v && `https://github.com/${v}`}
                        template={customField.template}
                        onChange={(_, __, item) => {
                          const nextValues = [...values]
                          nextValues[i] = item?.value?.id
                          onInputChange(key)(_, nextValues.filter(Boolean))
                        }}
                      />
                    )
                  })}
                  {lastValueEmpty ? (
                    <A
                      href='#cancel'
                      onClick={e => {
                        e.preventDefault()
                        onInputChange(key)(
                          e,
                          values.slice(0, values.length - 1)
                        )
                      }}
                    >
                      Abbrechen
                    </A>
                  ) : (
                    <A
                      href='#add'
                      onClick={e => {
                        e.preventDefault()
                        onInputChange(key)(e, [...values, ''])
                      }}
                    >
                      Dokument hinzufügen
                    </A>
                  )}
                </div>
              )
            } else if (customField.items) {
              const defaultOnChange = onInputChange(key)
              input = (
                <Dropdown
                  black={black}
                  items={customField.items}
                  label={label}
                  value={value}
                  onChange={item => defaultOnChange(undefined, item.value)}
                />
              )
            } else if (key.match(/image|src/i)) {
              input = (
                <ImageInput
                  maxWidth='100%'
                  label={label}
                  src={value}
                  onChange={onInputChange(key)}
                />
              )
            } else if (typeof value === 'boolean') {
              input = (
                <Checkbox
                  checked={value}
                  onChange={onInputChange(key)}
                  black={black}
                >
                  {label}
                </Checkbox>
              )
            } else {
              let renderInput
              if (key.match(/description|quote|shortTitle/i)) {
                renderInput = ({ ref, ...inputProps }) => (
                  <AutosizeInput
                    {...styles.autoSize}
                    {...inputProps}
                    inputRef={ref}
                  />
                )
                if (key === 'shortTitle') {
                  const defaultOnChange = onInputChange(key)
                  onChange = (_, inputValue) => {
                    const value = (inputValue || '').replace(/\n/g, '')
                    defaultOnChange(_, value)
                  }
                }
              } else if (key.match(/date/i)) {
                renderInput = ({ ref, ...inputProps }) => (
                  <MaskedInput
                    {...inputProps}
                    {...styles.mask}
                    placeholderChar={'_'}
                    mask={dateMask}
                  />
                )
                const dateValue =
                  value instanceof Date
                    ? value
                    : parseDate(value) || (value && new Date(value))
                formattedValue =
                  this.state[key] !== undefined
                    ? this.state[key].formatted
                    : dateValue
                    ? formatDate(dateValue)
                    : ''

                onChange = (_, inputValue) => {
                  const parsedValue = parseDate(inputValue) || ''
                  this.setState(
                    {
                      [key]: {
                        formatted: inputValue,
                        value: parsedValue !== value ? parsedValue : value
                      }
                    },
                    () => {
                      if (parsedValue !== value) {
                        onInputChange(key)(_, parsedValue)
                      }
                    }
                  )
                }
              }
              input = (
                <Field
                  label={label}
                  name={key}
                  value={formattedValue}
                  renderInput={renderInput}
                  black={black}
                  onChange={onChange || onInputChange(key)}
                />
              )
            }
            const isShort = !!key.match(/short/i)
            return (
              <div key={key} {...styles.span} style={{ width: getWidth(key) }}>
                {input}
                {(notes.get(key) || isShort) && (
                  <Label
                    style={{
                      display: 'block',
                      marginBottom: 10,
                      marginTop: -10
                    }}
                  >
                    {notes.get(key)}{' '}
                    {isShort && formattedValue && formattedValue.length
                      ? t('metaData/field/short/count', {
                          count: formattedValue.length
                        })
                      : ' '}
                  </Label>
                )}
              </div>
            )
          })
          .toArray()}
      </div>
    )
  }
}

export default withT(Form)
