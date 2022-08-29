import React, { useEffect } from 'react'
import { useSlate } from 'slate-react'
import { config as elConfig } from '../config/elements'
import { ToolbarButton } from './Toolbar'
import { CustomElementsType, ButtonConfig } from '../custom-types'
import { toggleElement } from './helpers/structure'
import { useFormContext } from './Forms'
import { Editor } from 'slate'

export const ElementButton: React.FC<{
  config: ButtonConfig
}> = ({ config }) => {
  const editor = useSlate()
  const setFormPath = useFormContext()[1]
  const element = elConfig[config.type]

  if (!element?.button) {
    return null
  }

  return (
    <ToolbarButton
      title={`convert to ${config.type}`}
      button={element.button}
      disabled={config.disabled}
      active={config.active}
      disableWhenActive={!elConfig[config.type]?.attrs?.isInline}
      onClick={() => {
        const insertPath = toggleElement(
          editor,
          config.type as CustomElementsType,
        )
        setTimeout(() => {
          setFormPath(insertPath)
        })
      }}
    />
  )
}
