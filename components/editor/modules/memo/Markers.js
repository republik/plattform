import React from 'react'
import { css } from 'glamor'

const styles = {
  marker: css({
    border: '1px solid transparent',
    borderRadius: '4px',
    marginRight: 10,
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
          backgroundColor: `rgb(255,240,0)`,
          boxShadow: isSelected && 'rgb(240,255,0) 0px 0px 4px'
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
          boxShadow: isSelected && 'rgb(255,100,255) 0px 0px 4px'
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
          boxShadow: isSelected && 'rgb(0,255,0) 0px 0px 4px'
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
          boxShadow: isSelected && 'rgb(0,230,230) 0px 0px 4px'
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
          position: 'relative',
          borderRadius: 0
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
            boxShadow: isSelected && 'red 0px 0px 2px'
          }}
        />
      </div>
    )
  },
  Marker: ({ onDoubleClick, children }) => (
    <span
      style={{
        borderBottom: `3px solid`,
        borderBottomColor: 'red'
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
          boxShadow: isSelected && 'rgba(0,0,0,0.1) 0px 0px 4px'
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
