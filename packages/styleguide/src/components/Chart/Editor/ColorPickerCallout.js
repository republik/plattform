import React from 'react'
import { BlockPicker as ColorPicker } from 'react-color'
import { plainButtonRule } from '../../Button'
import CalloutMenu from '../../Callout/CalloutMenu'
import { useColorContext } from '../../Colors/ColorContext'

const ColorPickerCallout = ({ mode, pickableColors, color, onChange }) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('backgroundColor', 'default')}
      style={{
        padding: 4,
        lineHeight: 0,
      }}
    >
      <CalloutMenu
        Element={(props) => (
          <button
            {...plainButtonRule}
            {...colorScheme.set('backgroundColor', color, 'charts')}
            {...props}
            style={{
              ...props.style,
              width: mode ? 15 : 30,
              height: 15,
              borderRadius: 4,
            }}
          />
        )}
        align='right'
      >
        <ColorPicker
          triangle='hide'
          colors={pickableColors}
          color={color}
          onChange={onChange}
        />
      </CalloutMenu>
    </div>
  )
}

export default ColorPickerCallout
