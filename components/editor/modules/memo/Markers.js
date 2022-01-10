import React from 'react'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'

const styles = {
  marker: css({
    border: '1px solid transparent',
    borderRadius: '4px',
    marginRight: 6,
    width: 32,
    height: 32,
    verticalAlign: 'middle',
    cursor: 'pointer'
  })
}

export const yellow = {
  Picker: ({ isSelected, onClick }) => {
    return (
      <div
        {...styles.marker}
        style={{
          backgroundColor: `rgb(255,255,0)`,
          borderColor: isSelected && 'black'
        }}
        onClick={onClick}
      />
    )
  },
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <span
      style={{
        backgroundColor: isSelected ? `rgb(255,255,0)` : `rgba(255,255,0,0.4)`,
        paddingTop: '.2em',
        paddingBottom: '.2em'
      }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </span>
  )
}

export const pink = {
  Picker: ({ isSelected, onClick }) => {
    return (
      <div
        {...styles.marker}
        style={{
          backgroundColor: `rgb(255,100,255)`,
          borderColor: isSelected && 'black'
        }}
        onClick={onClick}
      />
    )
  },
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <span
      style={{
        backgroundColor: isSelected
          ? `rgb(255,100,255)`
          : `rgba(255,100,255,0.5)`,
        paddingTop: '.2em',
        paddingBottom: '.2em'
      }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </span>
  )
}

export const green = {
  Picker: ({ isSelected, onClick }) => {
    return (
      <div
        {...styles.marker}
        style={{
          backgroundColor: `rgb(0,255,0)`,
          borderColor: isSelected && 'black'
        }}
        onClick={onClick}
      />
    )
  },
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <span
      style={{
        backgroundColor: isSelected ? `rgb(0,255,0)` : `rgba(0,255,0,0.5)`,
        paddingTop: '.2em',
        paddingBottom: '.2em'
      }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </span>
  )
}

export const blue = {
  Picker: ({ isSelected, onClick }) => {
    return (
      <div
        {...styles.marker}
        style={{
          backgroundColor: `rgb(0,230,230)`,
          borderColor: isSelected && 'black'
        }}
        onClick={onClick}
      />
    )
  },
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <span
      style={{
        backgroundColor: isSelected ? `rgb(0,230,230)` : `rgba(0,230,230,0.5)`,
        paddingTop: '.2em',
        paddingBottom: '.2em'
      }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </span>
  )
}

export const rotstift = {
  Picker: ({ isSelected, onClick }) => {
    return (
      <div
        {...styles.marker}
        style={{
          borderTopColor: isSelected && 'black',
          borderRightColor: isSelected && 'black',
          borderLeftColor: isSelected && 'black',
          borderBottom: `3px solid ${colors.error}`
        }}
        onClick={onClick}
      />
    )
  },
  Marker: ({ onDoubleClick, children }) => (
    <span
      style={{
        borderBottom: `3px solid`,
        borderBottomColor: colors.error
      }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </span>
  )
}

export const drop = {
  Picker: ({ isSelected, onClick }) => {
    return (
      <div
        {...styles.marker}
        style={{
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderColor: isSelected && 'black'
        }}
        onClick={onClick}
      />
    )
  },
  Marker: ({ isSelected, onDoubleClick, children }) => (
    <span
      style={{ opacity: isSelected ? 0.6 : 0.3 }}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </span>
  )
}

export default yellow
