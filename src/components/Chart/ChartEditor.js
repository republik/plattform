import React, { useRef, useEffect, useState, useMemo } from 'react'
import { css } from 'glamor'
import { csvParse } from 'd3-dsv'

import Field from '../Form/Field'
import Dropdown from '../Form/Dropdown'
import { Interaction } from '../Typography'

const styles = {
  wrapper: css({}),
  row: css({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-between'
  }),
  column: css({
    width: '48%',
    position: 'relative'
  })
}

const ChartEditor = ({ data, value, onChange }) => {
  const chartData = useMemo(() => csvParse(data), [data])

  const columnNames = Object.keys(chartData[0])

  const xAxisColumns = columnNames.map(d => {
    return { value: d, text: d }
  })

  const createOnFieldChange = key => {
    return (_, newValue) => {
      onChange({ ...value, [key]: newValue })
    }
  }

  const createOnDropdownChange = (key, item) => {
    return onChange({ ...value, [key]: item.value })
  }

  const numberFormats = [
    {
      value: '.0%',
      text: '20%'
    },
    {
      value: '.0f',
      text: '20'
    },
    {
      value: '.1f',
      text: '20,0'
    }
  ]

  return (
    <div {...styles.wrapper}>
      <div {...styles.row}>
        <div {...styles.column}>
          <Interaction.H3>Horizontale Achse</Interaction.H3>
          <Dropdown
            label='Spalte auswählen'
            items={xAxisColumns}
            value={value.x === undefined ? '.0%' : value.x}
            onChange={item => {
              createOnDropdownChange('x', item)
            }}
          />
          <Dropdown
            label='Achsenformat'
            items={numberFormats}
            value={
              value.numberFormat === undefined ? '.0%' : value.numberFormat
            }
            onChange={item => {
              createOnDropdownChange('numberFormat', item)
            }}
          />
        </div>
        <div {...styles.column}>
          <Interaction.H3>Vertikale Achse</Interaction.H3>
          <Dropdown
            label='Spalte auswählen'
            items={xAxisColumns}
            value={value.x === undefined ? '.0%' : value.x}
            onChange={item => {
              createOnDropdownChange('x', item)
            }}
          />
          <Dropdown
            label='Achsenformat'
            items={numberFormats}
            value={
              value.numberFormat === undefined ? '.0%' : value.numberFormat
            }
            onChange={item => {
              createOnDropdownChange('numberFormat', item)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ChartEditor
