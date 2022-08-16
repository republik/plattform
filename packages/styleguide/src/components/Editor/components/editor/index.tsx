import React, { useCallback, useEffect, useRef } from 'react'
import { createEditor, Editor, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  useSelected,
} from 'slate-react'
import { useMemoOne } from 'use-memo-one'
import { withNormalizations } from './decorators/normalization'
import { withElAttrsConfig } from './decorators/attrs'
import Footer from './ui/Footer'
import { FormContextProvider, FormOverlay, useFormContext } from './ui/Forms'
import Toolbar from './ui/Toolbar'
import { config as elementsConfig } from '../../config/elements'
import { LeafComponent } from './ui/Mark'
import {
  CustomDescendant,
  CustomEditor,
  CustomElement,
  EditorConfig,
  NodeTemplate,
} from '../../custom-types'
import { NAV_KEYS, navigateOnTab } from './helpers/tree'
import { handleInsert, insertOnKey } from './helpers/structure'
import { withInsert } from './decorators/insert'
import { withDelete } from './decorators/delete'
import { useColorContext } from '../../../Colors/ColorContext'
import { withCustomConfig } from './decorators/config'
import { LayoutContainer } from './ui/Layout'
import { ErrorMessage } from './ui/ErrorMessage'
import { getCharCount } from './helpers/text'
import BlockUi from './ui/BlockUi'

export type SlateEditorProps = {
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
  editor?: CustomEditor
  config: EditorConfig
}

const SlateEditor: React.FC<SlateEditorProps> = ({
  value,
  setValue,
  structure,
  editor: mockEditor,
  config,
}) => {
  const editor = useMemoOne<CustomEditor>(
    () =>
      withInsert(config)(
        withDelete(
          withNormalizations(structure)(
            withElAttrsConfig(
              withCustomConfig(config)(
                withReact(withHistory(mockEditor ?? createEditor())),
              ),
            ),
          ),
        ),
      ),
    [],
  )
  const containerRef = useRef<HTMLDivElement>()

  useEffect(() => {
    Editor.normalize(editor, { force: true })
  }, [])

  const RenderedElement: React.FC<{
    element: CustomElement
    attributes: any
  }> = ({ element, children, attributes }) => {
    const [colorScheme] = useColorContext()
    const setFormPath = useFormContext()[1]
    const isSelected = useSelected()
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
    const blockUi = config.attrs?.blockUi
    const highlightSelected = config.attrs?.highlightSelected
    const Component =
      editor.customConfig.editorSchema?.[config.component] ||
      editor.customConfig.schema[config.component]

    if (!Component) {
      console.log(editor.customConfig)
      return (
        <ErrorMessage
          attributes={attributes}
          error={`${config.component} component missing in schema`}
        >
          {children}
        </ErrorMessage>
      )
    }
    const path = ReactEditor.findPath(editor, element)
    const selectVoid = (e) => {
      if (isVoid) {
        e.preventDefault()
        Transforms.select(editor, path)
      }
    }
    const baseStyles = { position: 'relative' }
    return (
      <Component
        {...(isSelected &&
          highlightSelected &&
          colorScheme.set('borderColor', 'primary'))}
        {...element}
        attributes={attributes}
        style={
          isSelected && highlightSelected
            ? {
                ...attributes.style,
                ...baseStyles,
                borderWidth: 2,
                borderStyle: 'solid',
              }
            : { ...attributes.style, ...baseStyles }
        }
        onMouseDown={selectVoid}
        onDoubleClick={(e) => {
          e.stopPropagation()
          setFormPath(path)
        }}
      >
        {blockUi && isSelected && (
          <BlockUi path={path} element={element} blockUi={blockUi} />
        )}
        {children}
      </Component>
    )
  }

  const renderElement = useCallback(RenderedElement, [])

  const renderLeaf = useCallback(
    ({ children, ...props }) => (
      <LeafComponent {...props}>{children}</LeafComponent>
    ),
    [],
  )

  return (
    <div ref={containerRef}>
      <FormContextProvider>
        <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => {
            // console.log({ newValue })
            setValue(newValue)
          }}
        >
          <FormOverlay />
          <Toolbar containerRef={containerRef} />
          <LayoutContainer
            style={{ position: 'sticky', zIndex: 1 }}
            schema={config.schema}
          >
            <Editable
              readOnly={config.readOnly}
              data-testid='slate-content-editable'
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onKeyDown={(event) => {
                // console.log('event', event.key, event.shiftKey, event)

                // disable key down events if max signs is reached
                if (
                  config.maxSigns &&
                  getCharCount(editor.children) >= config.maxSigns &&
                  !NAV_KEYS.concat('Backspace').includes(event.key)
                ) {
                  event.preventDefault()
                  return false
                }

                insertOnKey({ name: 'Enter', shift: true }, 'break')(
                  editor,
                  event,
                )
                handleInsert(editor, event)
                navigateOnTab(editor, event)
              }}
            />
          </LayoutContainer>
          <Footer config={config} />
        </Slate>
      </FormContextProvider>
    </div>
  )
}

export default SlateEditor
