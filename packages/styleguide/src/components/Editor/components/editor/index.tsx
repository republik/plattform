import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { createEditor, Editor } from 'slate'
import { withHistory } from 'slate-history'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
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
  NodeTemplate
} from '../../custom-types'
import { navigateOnTab } from './helpers/tree'
import { handleInsert, insertOnKey } from './helpers/structure'
import { CHAR_LIMIT } from './helpers/text'
import { withInsert } from './decorators/insert'

const SlateEditor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
}> = ({ value, setValue, structure }) => {
  const editor = useMemoOne<CustomEditor>(
    () =>
      withInsert(CHAR_LIMIT)(
        withNormalizations(structure)(
          withElAttrsConfig(withReact(withHistory(createEditor())))
        )
      ),
    []
  )
  const [formElementPath, setFormElementPath] = useState<number[]>()
  const containerRef = useRef<HTMLDivElement>()

  useEffect(() => {
    Editor.normalize(editor, { force: true })
  }, [])

  const RenderedElement: React.FC<PropsWithChildren<{
    element: CustomElement
  }>> = props => {
    const Component = elementsConfig[props.element.type].Component
    const showDataForm = e => {
      e.stopPropagation()
      const path = ReactEditor.findPath(editor, props.element)
      setFormElementPath(path)
    }
    return <Component {...props} onDoubleClick={showDataForm} />
  }

  const renderElement = useCallback(RenderedElement, [])

  const renderLeaf = useCallback(
    ({ children, ...props }) => (
      <LeafComponent {...props}>{children}</LeafComponent>
    ),
    []
  )

  return (
    <div ref={containerRef}>
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <FormOverlay
          path={formElementPath}
          onClose={() => setFormElementPath(null)}
        />
        <Toolbar containerRef={containerRef} />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={event => {
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
