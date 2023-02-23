import React, { ReactNode, useEffect, useState } from 'react'
import { ReactEditor, useSelected, useSlate } from 'slate-react'
import {
  config as elementsConfig,
  config as elConfig,
} from '../config/elements'
import { ToolbarButton } from './Toolbar'
import {
  CustomElementsType,
  ButtonConfig,
  CustomEditor,
  CustomElement,
} from '../custom-types'
import { toggleElement } from './helpers/structure'
import { useFormContext } from './Forms'
import { Node } from 'slate'
import { useRenderContext } from '../Render/Context'
import { ErrorMessage } from '../Render/Message'
import BlockUi from './BlockUi'
import { selectNode } from './helpers/tree'

export const ElementComponent: React.FC<{
  children?: ReactNode
  editor: CustomEditor
  element: CustomElement
  attributes: any
}> = ({ element, children, attributes }) => {
  const editor = useSlate()
  const [_, setFormPath] = useFormContext()
  const isSelected = useSelected()
  const path = ReactEditor.findPath(editor, element)
  const config = elementsConfig[element.type]
  if (!config) {
    return (
      <ErrorMessage
        attributes={attributes}
        error={`${element.type} config missing`}
      >
        {children}
      </ErrorMessage>
    )
  }
  const isVoid = config.attrs?.isVoid
  const showBlockUi =
    !config.attrs?.isInline && (config.Form || element.template?.repeat)
  const Component =
    editor.customConfig.editorSchema?.[element.type] ||
    editor.customConfig.schema[element.type]

  if (!Component) {
    return (
      <ErrorMessage
        attributes={attributes}
        error={`${element.type} component missing in schema`}
      >
        {children}
      </ErrorMessage>
    )
  }
  const selectVoid = (e) => {
    if (isVoid) {
      e.preventDefault()
      selectNode(editor, path)
    }
  }
  const baseStyles = showBlockUi
    ? { position: 'relative', display: 'block' }
    : {}

  return (
    <Component
      {...element}
      slatechildren={element.children}
      attributes={{
        ...attributes,
        style: { ...attributes.style, ...baseStyles },
      }}
      onMouseDown={selectVoid}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setFormPath(path)
      }}
    >
      {showBlockUi && isSelected && <BlockUi path={path} element={element} />}
      {children}
    </Component>
  )
}

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
