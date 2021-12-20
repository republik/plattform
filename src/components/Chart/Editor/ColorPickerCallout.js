import React from 'react'
import { BlockPicker as ColorPicker } from 'react-color'
import { plainButtonRule } from '../../Button'
import CalloutMenu from '../../Callout/CalloutMenu'
import {
  useColorContext
} from '../../Colors/ColorContext'

const ColorPickerCallout = ({ mode, pickableColors, color, onChange }) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('backgroundColor', 'default')}
      style={{
        padding: mode === 'dark' 
          ? '4px 4px 4px 0' 
          : mode === 'light' 
            ? '4px 0px 4px 4px'
            : 4
      }}
    >
      <CalloutMenu
        Element={props => (
          <button
            {...plainButtonRule}
            {...colorScheme.set('backgroundColor', color, 'charts')}
            {...props}
            style={{
              ...props.style,
              width: mode ? 15 : 30,
              height: 15,
              borderRadius: mode === 'dark' 
              ? '0px 4px 4px 0' 
              : mode === 'light' 
                ? '4px 0 0 4px'
                : 4,
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
