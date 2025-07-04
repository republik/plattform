import { css } from 'glamor'
import React from 'react'
import { markersConfig, MarkerType } from '../../Marker'

const styles = {
  picker: css({
    border: '1px solid transparent',
    borderRadius: '4px',
    marginRight: 10,
    width: 32,
    height: 32,
    verticalAlign: 'middle',
    cursor: 'pointer',
  }),
}

export const Picker: React.FC<{
  marker: MarkerType
  isSelected?: boolean
  onClick: React.MouseEventHandler
}> = ({ marker = 'yellow', isSelected, onClick }) => {
  const {
    color: markerColor,
    pickerColor,
    pickerInnerStyle,
  } = markersConfig[marker]
  const color = pickerColor || markerColor
  const colorStyle = color
    ? {
        backgroundColor: color,
        boxShadow: isSelected && `${color} 0px 0px 4px`,
      }
    : {}
  return (
    <div
      {...styles.picker}
      style={{ ...colorStyle, position: 'relative' }}
      onClick={onClick}
    >
      {!!pickerInnerStyle && <div style={pickerInnerStyle(isSelected)} />}
    </div>
  )
}
