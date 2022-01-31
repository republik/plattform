import React from 'react'
import { useSlate } from 'slate-react'
import { config as elConfig } from '../../elements'
import { ToolbarButton } from './Toolbar'
import {InsertButtonConfig} from '../../../custom-types'
import { buildAndInsert } from '../helpers/structure'

export const ContainerComponent: React.FC<{
  [x: string]: unknown
}> = ({ props, children }) => {
  return <div {...props}>{children}</div>
}

export const InsertButton: React.FC<{
  config: InsertButtonConfig
}> = ({ config }) => {
  const editor = useSlate()
  const element = elConfig[config.type]
  if (!element?.button) {
    return null
  }
  return (
    <ToolbarButton
      button={element.button}
      disabled={config.disabled}
      onClick={() => {
        buildAndInsert(editor, config.type)
      }}
    />
  )
}
