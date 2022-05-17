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
import { config as elementsConfig } from '../schema/elements'
import { LeafComponent } from './ui/Mark'
import {
  CustomDescendant,
  CustomEditor,
  CustomElement,
  NodeTemplate,
} from '../../custom-types'
import { navigateOnTab } from './helpers/tree'
import { handleInsert, insertOnKey } from './helpers/structure'
import { CHAR_LIMIT } from './helpers/text'
import { withInsert } from './decorators/insert'
import { withDelete } from './decorators/delete'
import { useColorContext } from '../../../Colors/ColorContext'

const SlateEditor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
  editor?: CustomEditor
}> = ({ value, setValue, structure, editor: mockEditor }) => {
  const editor = useMemoOne<CustomEditor>(
    () =>
      withInsert(CHAR_LIMIT)(
        withDelete(
          withNormalizations(structure)(
            withElAttrsConfig(
              withReact(withHistory(mockEditor ?? createEditor())),
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
    const isVoid = config.attrs?.isVoid
    const highlightSelected = config.attrs?.highlightSelected
    const Component = config.Component
    const path = ReactEditor.findPath(editor, element)
    const selectVoid = (e) => {
      if (isVoid) {
        e.preventDefault()
        Transforms.select(editor, path)
      }
    }
    return (
      <Component
        {...colorScheme.set('borderColor', 'primary')}
        style={
          isSelected && highlightSelected
            ? { borderWidth: 2, borderStyle: 'solid' }
            : {}
        }
        {...element}
        attributes={attributes}
        onMouseDown={selectVoid}
        onDoubleClick={(e) => {
          console.log('double click')
          e.stopPropagation()
          setFormPath(path)
        }}
      >
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
          <Toolbar containerRef={containerRef} mode='sticky' />
          <Editable
            data-testid='slate-content-editable'
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(event) => {
              // console.log('event', event.key, event.shiftKey)
              insertOnKey({ name: 'Enter', shift: true }, 'break')(
                editor,
                event,
              )
              handleInsert(editor, event)
              navigateOnTab(editor, event)
            }}
          />
          <Footer charLimit={CHAR_LIMIT} />
        </Slate>
      </FormContextProvider>
    </div>
  )
}

export default SlateEditor
