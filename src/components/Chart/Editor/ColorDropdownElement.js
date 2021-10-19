import React from 'react'

export const ColorDropdownElement = props => {
  const { colorRange } = props
  return (
    <div style={{ display: 'flex', height: '25px', marginRight: '50px' }}>
      {colorRange.map((d, i) => (
        <span
          key={d + i}
          style={{
            display: 'inline-block',
            flex: 1,
            backgroundColor: d
          }}
        />
      ))}
    </div>
  )
}
