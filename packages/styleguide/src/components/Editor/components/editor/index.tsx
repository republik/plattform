import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
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
import { FormOverlay } from './ui/Forms'
import Toolbar from './ui/Toolbar'
import { config as elementsConfig } from '../elements'
import { LeafComponent } from './ui/Mark'
import {
  CustomDescendant,
  CustomEditor,
  CustomElement,
  NodeTemplate,
} from '../../custom-types'
import { getTextNode, navigateOnTab } from './helpers/tree'
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
  const [formElementPath, setFormElementPath] = useState<number[]>()
  const containerRef = useRef<HTMLDivElement>()

  useEffect(() => {
    Editor.normalize(editor, { force: true })
  }, [])

  const RenderedElement: React.FC<
    PropsWithChildren<{
      element: CustomElement
    }>
  > = (props) => {
    const [colorScheme] = useColorContext()
    const isSelected = useSelected()
    const config = elementsConfig[props.element.type]
    const isVoid = config.attrs?.isVoid
    const Component = config.Component
    const path = ReactEditor.findPath(editor, props.element)
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
          isSelected && isVoid ? { borderWidth: 2, borderStyle: 'solid' } : {}
        }
        {...props}
        onMouseDown={selectVoid}
        onDoubleClick={(e) => {
          e.stopPropagation()
          setFormElementPath(path)
        }}
      />
    )
  }

  const renderElement = useCallback(RenderedElement, [])

  const renderLeaf = useCallback(
    ({ children, ...props }) => (
      <LeafComponent {...props} setFormElementPath={setFormElementPath}>
        {children}
      </LeafComponent>
    ),
    [],
  )

  return (
    <div ref={containerRef}>
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          // console.log(newValue)
          setValue(newValue)
        }}
      >
        <FormOverlay
          path={formElementPath}
          onClose={() => setFormElementPath(undefined)}
        />
        <Toolbar containerRef={containerRef} mode='sticky' />
        <Editable
          data-testid='slate-content-editable'
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            // console.log('event', event.key, event.shiftKey)
            insertOnKey({ name: 'Enter', shift: true }, 'break')(editor, event)
            handleInsert(editor, event)
            navigateOnTab(editor, event)
          }}
        />
        <Footer charLimit={CHAR_LIMIT} />
      </Slate>
    </div>
  )
}

export default SlateEditor
