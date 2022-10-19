import React from 'react'
import { css } from 'glamor'
import { color as d3Color } from 'd3-color'

const styles = {
  marker: css({
    border: '1px solid transparent',
    borderRadius: '4px',
    marginRight: 10,
    width: 32,
    height: 32,
    verticalAlign: 'middle',
    cursor: 'pointer',
  }),
}

const MarkerConfig = {
  yellow: {
    color: 'rgb(255,255,0)',
  },
  pink: {
    color: 'rgb(255,100,255)',
  },
  green: {
    color: 'rgb(0,255,0)',
  },
  blue: {
    color: 'rgb(0,230,230)',
  },
  rotstift: {
    style: () => ({
      borderBottom: `3px solid`,
      borderBottomColor: 'red',
    }),
    pickerInnerStyle: (isSelected) => ({
      borderRadius: 4,
      position: 'absolute',
      backgroundColor: 'red',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      boxShadow: isSelected && 'red 0px 0px 2px',
    }),
  },
  drop: {
    style: (isSelected) => ({ opacity: isSelected ? 0.6 : 0.3 }),
    pickerColor: 'rgba(0,0,0,0.1)',
  },
}

export const Memo = ({
  marker = 'yellow',
  isSelected,
  children,
  attributes,
  ...props
}) => {
  const { color, style } = MarkerConfig[marker]
  return (
    <span
      {...props}
      {...attributes}
      style={
        style
          ? style(isSelected)
          : {
              backgroundColor: isSelected
                ? color
                : d3Color(color).copy({ opacity: 0.4 }).toString(),
              paddingTop: '.2em',
              paddingBottom: '.2em',
            }
      }
    >
      {children}
    </span>
  )
}

export const Picker = ({ marker = 'yellow', isSelected, onClick }) => {
  const {
    color: markerColor,
    pickerColor,
    pickerInnerStyle,
  } = MarkerConfig[marker]
  const color = pickerColor || markerColor
  const colorStyle = color
    ? {
        backgroundColor: color,
        boxShadow: isSelected && `${color} 0px 0px 4px`,
      }
    : {}
  return (
    <div
      {...styles.marker}
      style={{ ...colorStyle, position: 'relative' }}
      onClick={onClick}
    >
      {!!pickerInnerStyle && <div style={pickerInnerStyle(isSelected)} />}
    </div>
  )
}

const ColorPicker = ({ isSelected, onClick, color }) => {
  return (
    <div
      {...styles.marker}
      style={{
        backgroundColor: color,
        boxShadow: isSelected && `${color} 0px 0px 4px`,
      }}
      onClick={onClick}
    />
  )
}

export const yellow = {
  Picker: ({ isSelected, onClick }) => (
    <ColorPicker
      isSelected={isSelected}
      onClick={onClick}
      color='rgb(255,255,0)'
    />
  ),
}

export const pink = {
  Picker: ({ isSelected, onClick }) => (
    <ColorPicker
      isSelected={isSelected}
      onClick={onClick}
      color='rgb(255,100,255)'
    />
  ),
}

export const green = {
  Picker: ({ isSelected, onClick }) => (
    <ColorPicker
      isSelected={isSelected}
      onClick={onClick}
      color='rgb(0,255,0)'
    />
  ),
}

export const blue = {
  Picker: ({ isSelected, onClick }) => (
    <ColorPicker
      isSelected={isSelected}
      onClick={onClick}
      color='rgb(0,230,230)'
    />
  ),
}

export const rotstift = {
  Picker: ({ isSelected, onClick }) => {
    return (
      <div
        {...styles.marker}
        style={{
          position: 'relative',
          borderRadius: 0,
        }}
        onClick={onClick}
      >
        <div
          style={{
            borderRadius: 4,
            position: 'absolute',
            backgroundColor: 'red',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            boxShadow: isSelected && 'red 0px 0px 2px',
          }}
        />
      </div>
    )
  },
}

export const drop = {
  Picker: ({ isSelected, onClick }) => (
    <ColorPicker
      isSelected={isSelected}
      onClick={onClick}
      color='rgba(0,0,0,0.1)'
    />
  ),
}

export default yellow
