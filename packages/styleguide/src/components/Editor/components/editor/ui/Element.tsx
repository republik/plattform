import React, { useEffect, useState } from 'react'
import { useSlate } from 'slate-react'
import { config as elConfig } from '../../schema/elements'
import { ToolbarButton } from './Toolbar'
import { CustomElementsType, ButtonConfig } from '../../../custom-types'
import { createElement } from '../helpers/structure'
import { useFormContext } from './Forms'

export const ContainerComponent: React.FC<{
  [x: string]: unknown
}> = ({ props, children }) => {
  return <div {...props}>{children}</div>
}

export const ElementButton: React.FC<{
  config: ButtonConfig
}> = ({ config }) => {
  const editor = useSlate()
  const setFormPath = useFormContext()[1]
  const [pendingFormPath, setPendingFormPath] = useState<number[]>()
  const element = elConfig[config.type]

  // slightly cleaner hack than the use of timeout
  // to update formPath AFTER the insert has completed
  // and the value was updated.
  useEffect(() => {
    if (pendingFormPath) {
      setFormPath(pendingFormPath)
      setPendingFormPath(undefined)
    }
  }, [editor.children])

  if (!element?.button) {
    return null
  }

  return (
    <ToolbarButton
      title={`convert-to-${config.type}`}
      button={element.button}
      disabled={config.disabled}
      active={config.active}
      disableWhenActive={true}
      onClick={() => {
        const insertPath = createElement(
          editor,
          config.type as CustomElementsType,
        )
        setPendingFormPath(insertPath)
      }}
    />
  )
}
