import React from 'react'

import { css } from 'glamor'
import { Interaction } from '../../Typography'
import Field from '../../Form/Field'
import Checkbox from '../../Form/Checkbox'
import Slider from '../../Form/Slider'
import { TickField } from './TickField'
import { ColorField } from './ColorField'
import { AxisFormatDropdown } from './AxisFormatDropdown'
import { determineAxisContext } from './utils'
import CustomValueDropdown from './CustomValueDropdown'

const styles = {
  gridContainer: css({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px 20px',
    margin: '20px 0',
  }),
  box: css({
    padding: '10px',
    border: '1px solid #c0c0c0',
  }),
}

export const FormFields = (props) => {
  const {
    fields,
    onFieldsChange,
    createOnDropdownChange,
    createOnFieldChange,
    createOnNumberFieldChange,
    value,
    chartData,
    defaultProps,
  } = props
  const fieldsKeys = Object.keys(fields)

  return (
    <div {...styles.gridContainer}>
      {fieldsKeys.map((group) => {
        const groupObject = fields[group].properties
        return (
          <div {...styles.box} key={group}>
            <Interaction.P>
              <strong>{fields[group].title}</strong>
            </Interaction.P>
            {Object.keys(fields[group].properties).map((property) => {
              if (property === 'colorRange') {
                return (
                  <ColorField
                    key={property}
                    label={groupObject[property].title}
                    items={groupObject[property].enum}
                    colorRange={value[property] || defaultProps[property]}
                    colorMap={value.colorMap}
                    config={value}
                    onFieldsChange={onFieldsChange}
                    colorColumn={value.color || defaultProps.color}
                    chartData={chartData}
                  />
                )
              }
              if (groupObject[property].format === 'dynamicDropdown') {
                return (
                  <AxisFormatDropdown
                    key={property}
                    property={property}
                    value={value[property] || defaultProps[property] || ''}
                    onChange={createOnDropdownChange}
                    defaultProps={defaultProps}
                    context={determineAxisContext(
                      groupObject[property].parent,
                      value,
                      defaultProps,
                    )}
                    parent={groupObject[property].parent}
                    xNumberFormat={value.xNumberFormat}
                    timeParse={value.timeParse}
                  />
                )
              }
              if (groupObject[property].enum) {
                return (
                  <CustomValueDropdown
                    key={property}
                    label={groupObject[property].title}
                    items={groupObject[property].enum}
                    value={value[property] || defaultProps[property] || ''}
                    onChange={createOnDropdownChange(property)}
                  />
                )
              }
              if (groupObject[property].type === 'array') {
                return (
                  <TickField
                    key={property}
                    property={property}
                    groupObject={groupObject}
                    value={value[property] || defaultProps[property]}
                    config={value}
                    createOnFieldChange={createOnFieldChange}
                    context={determineAxisContext(
                      property,
                      value,
                      defaultProps,
                    )}
                    timeParseDefault={defaultProps.timeParse}
                  />
                )
              }
              if (groupObject[property].type === 'boolean') {
                return (
                  <div key={property} style={{ marginTop: '20px' }}>
                    <Checkbox
                      checked={
                        value[property] === undefined
                          ? defaultProps[property]
                          : value[property]
                      }
                      onChange={createOnFieldChange(property)}
                    >
                      {groupObject[property].title}
                    </Checkbox>
                  </div>
                )
              }
              if (groupObject[property].format === 'Slider') {
                return (
                  <Slider
                    key={property}
                    label={
                      groupObject[property].title +
                      ' ' +
                      (value[property] || defaultProps[property])
                    }
                    value={value[property] || defaultProps[property]}
                    min='1'
                    max='4'
                    fullWidth
                    onChange={createOnFieldChange(property)}
                  />
                )
              }
              if (groupObject[property].type === 'number') {
                return (
                  <Field
                    key={property}
                    label={groupObject[property].title}
                    value={value[property]}
                    onChange={createOnNumberFieldChange(property)}
                  />
                )
              }
              return (
                <Field
                  key={property}
                  label={groupObject[property].title}
                  value={value[property]}
                  onChange={createOnFieldChange(property)}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
