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

const Highlighter = ({ isSelected, children, color, attributes, ...props }) => (
  <span
    {...props}
    {...attributes}
    style={{
      backgroundColor: isSelected
        ? color
        : d3Color(color).copy({ opacity: 0.4 }).toString(),
      paddingTop: '.2em',
      paddingBottom: '.2em',
    }}
  >
    {children}
  </span>
)

export const yellow = {
  Picker: ({ isSelected, onClick }) => (
    <ColorPicker
      isSelected={isSelected}
      onClick={onClick}
      color='rgb(255,255,0)'
    />
  ),
  Marker: ({ isSelected, children, ...props }) => (
    <Highlighter isSelected={isSelected} color='rgb(255,255,0)' {...props}>
      {children}
    </Highlighter>
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
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <Highlighter
      isSelected={isSelected}
      onDoubleClick={onDoubleClick}
      color='rgb(255,100,255)'
    >
      {children}
    </Highlighter>
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
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <Highlighter
      isSelected={isSelected}
      onDoubleClick={onDoubleClick}
      color='rgb(0,255,0)'
    >
      {children}
    </Highlighter>
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
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <Highlighter
      isSelected={isSelected}
      onDoubleClick={onDoubleClick}
      color='rgb(0,230,230)'
    >
      {children}
    </Highlighter>
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
  Marker: ({ onDoubleClick, children }) => (
    <span
      style={{
        borderBottom: `3px solid`,
        borderBottomColor: 'red',
      }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </span>
  ),
}

export const drop = {
  Picker: ({ isSelected, onClick }) => (
    <ColorPicker
      isSelected={isSelected}
      onClick={onClick}
      color='rgba(0,0,0,0.1)'
    />
  ),
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <span
      style={{ opacity: isSelected ? 0.6 : 0.3 }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </span>
  ),
}

export default yellow
