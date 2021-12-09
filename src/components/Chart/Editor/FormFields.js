import React from 'react'

import { css } from 'glamor'
import { Interaction } from '../../Typography'
import Field from '../../Form/Field'
import Dropdown from '../../Form/Dropdown'
import Checkbox from '../../Form/Checkbox'
import Slider from '../../Form/Slider'
import { TickField } from './TickField'
import { ColorField } from './ColorField'
import { AxisFormatDropdown } from './AxisFormatDropdown'
import { determineAxisContext } from './Editor.utils'

const styles = {
  gridContainer: css({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
    gap: '50px 30px',
    margin: '20px 0'
  })
}

export const FormFields = props => {
  const {
    fields,
    createOnDropdownChange,
    createOnFieldChange,
    createOnNumberFieldChange,
    createOnColorChange,
    timeFormatParser,
    value,
    chartData,
    customColors,
    colorRanges
  } = props
  const fieldsKeys = Object.keys(fields)

  return (
    <div {...styles.gridContainer}>
      {fieldsKeys.map(group => {
        const groupObject = fields[group].properties
        return (
          <div key={group}>
            <Interaction.H3>{fields[group].title}</Interaction.H3>
            {Object.keys(fields[group].properties).map(property => {
              if (property === 'colorRange') {
                return (
                  <ColorField
                    key={property}
                    label={groupObject[property].title}
                    items={groupObject[property].enum}
                    colorRange={
                      value[property] || groupObject[property].default
                    }
                    colorMap={value['colorMap']}
                    createOnFieldChange={createOnFieldChange}
                    createOnColorChange={createOnColorChange}
                    colorColumn={value['color'] || groupObject['color'].default}
                    chartData={chartData}
                    customColors={customColors}
                    colorRanges={colorRanges}
                  />
                )
              } else if (groupObject[property].format === 'dynamicDropdown') {
                return (
                  <AxisFormatDropdown
                    key={property}
                    property={property}
                    value={value[property] || groupObject[property].default}
                    onChange={createOnDropdownChange}
                    timeParseDefault={groupObject[property].timeParseDefault}
                    xNumberFormatDefault={
                      groupObject[property].xNumberFormatDefault
                    }
                    context={determineAxisContext(
                      groupObject[property].parent,
                      value
                    )}
                    parent={groupObject[property].parent}
                    xNumberFormat={value.xNumberFormat}
                    timeParse={value.timeParse}
                  />
                )
              } else if (groupObject[property].enum) {
                return (
                  <Dropdown
                    key={property}
                    label={groupObject[property].title}
                    items={groupObject[property].enum}
                    value={value[property] || groupObject[property].default}
                    onChange={createOnDropdownChange(property)}
                  />
                )
              } else if (groupObject[property].type === 'array') {
                return (
                  <TickField
                    key={property}
                    property={property}
                    groupObject={groupObject}
                    value={value[property] || groupObject[property].default}
                    createOnFieldChange={createOnFieldChange}
                    context={determineAxisContext(property, value)}
                    timeFormatParser={timeFormatParser}
                  />
                )
              } else if (groupObject[property].type === 'boolean') {
                return (
                  <div key={property} style={{ marginTop: '20px' }}>
                    <Checkbox
                      checked={
                        value[property] === undefined
                          ? groupObject[property].default
                          : value[property]
                      }
                      onChange={createOnFieldChange(property)}
                    >
                      {groupObject[property].title}
                    </Checkbox>
                  </div>
                )
              } else if (groupObject[property].format === 'Slider') {
                return (
                  <Slider
                    key={property}
                    label={
                      groupObject[property].title +
                      ' ' +
                      (value[property] || groupObject[property].default)
                    }
                    value={value[property] || groupObject[property].default}
                    min='1'
                    max='4'
                    fullWidth
                    onChange={createOnFieldChange(property)}
                  />
                )
              } else if (groupObject[property].type === 'number') {
                return (
                  <Field
                    key={property}
                    label={groupObject[property].title}
                    value={value[property]}
                    onChange={createOnNumberFieldChange(property)}
                  />
                )
              } else {
                return (
                  <Field
                    key={property}
                    label={groupObject[property].title}
                    value={value[property]}
                    onChange={createOnFieldChange(property)}
                  />
                )
              }
            })}
          </div>
        )
      })}
    </div>
  )
}
