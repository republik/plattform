import React, { useEffect, useState } from 'react'
import { useSlate } from 'slate-react'
import { config as elConfig } from '../config/elements'
import { ToolbarButton } from './Toolbar'
import { CustomElementsType, ButtonConfig } from '../custom-types'
import { toggleElement } from './helpers/structure'
import { useFormContext } from './Forms'
import { Node } from 'slate'
import { useRenderContext } from '../Render/Context'

export const ElementButton: React.FC<{
  config: ButtonConfig
}> = ({ config }) => {
  const { t } = useRenderContext()
  const editor = useSlate()
  const [pendingPath, setPendingPath] = useState<number[]>()
  const setFormPath = useFormContext()[1]
  const element = elConfig[config.type]

  useEffect(() => {
    if (pendingPath && Node.has(editor, pendingPath)) {
      setFormPath(pendingPath)
      setPendingPath(undefined)
    }
  }, [editor, pendingPath])

  if (!element?.button) {
    return null
  }

  return (
    <ToolbarButton
      title={t(`editor/element/${config.type}`)}
      button={element.button}
      disabled={config.disabled}
      active={config.active}
      disableWhenActive={!elConfig[config.type]?.attrs?.isInline}
      onClick={() => {
        const insertPath = toggleElement(
          editor,
          config.type as CustomElementsType,
        )
        setPendingPath(insertPath)
      }}
    />
  )
}
