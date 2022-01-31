import React from 'react'
import { useSlate } from 'slate-react'
import { config } from '../../elements'
import { ToolbarButton } from './Toolbar'
import { CustomElementsType } from '../../../custom-types'
import { buildAndInsert } from '../helpers/structure'

export const ContainerComponent: React.FC<{
  [x: string]: unknown
}> = ({ props, children }) => {
  return <div {...props}>{children}</div>
}

export const InsertButton: React.FC<{
  elKey: CustomElementsType
  disabled?: boolean
}> = ({ elKey, disabled }) => {
  const editor = useSlate()
  const element = config[elKey]
  if (!element?.button) {
    return null
  }
  return (
    <ToolbarButton
      button={element.button}
      disabled={disabled}
      onClick={() => {
        buildAndInsert(editor, elKey)
      }}
    />
  )
}
