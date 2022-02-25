import React from 'react'
import { fontStyles } from '../../Typography'

export const ColorDropdownElement = (props) => {
  const { colorRange, name } = props
  return (
    <div>
      <div style={{ ...fontStyles.sansSerifRegular14, marginBottom: '4px' }}>
        {name}
      </div>
      <div style={{ display: 'flex', height: '25px', marginRight: '50px' }}>
        {colorRange.map((d, i) => (
          <span
            key={d + i}
            style={{
              display: 'inline-block',
              flex: 1,
              backgroundColor: d,
            }}
          />
        ))}
      </div>
    </div>
  )
}
