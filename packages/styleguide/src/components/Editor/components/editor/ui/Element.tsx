import React from 'react'
import { useSlate } from 'slate-react'
import { config as elConfig } from '../../elements'
import { ToolbarButton } from './Toolbar'
import { CustomElementsType, ButtonConfig } from '../../../custom-types'
import { buildAndInsert } from '../helpers/structure'
import { useFormContext } from './Forms'

export const ContainerComponent: React.FC<{
  [x: string]: unknown
}> = ({ props, children }) => {
  return <div {...props}>{children}</div>
}

export const InsertButton: React.FC<{
  config: ButtonConfig
}> = ({ config }) => {
  const editor = useSlate()
  const [formPath, setFormPath] = useFormContext()
  const element = elConfig[config.type]
  if (!element?.button) {
    return null
  }
  return (
    <ToolbarButton
      button={element.button}
      disabled={config.disabled}
      active={config.active}
      disableWhenActive={true}
      onClick={() => {
        buildAndInsert(editor, config.type as CustomElementsType, setFormPath)
      }}
    />
  )
}
