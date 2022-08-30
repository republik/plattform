import React, {
  createContext,
  useContext,
  ReactElement,
  useMemo,
  useState,
} from 'react'
import { CustomEditor, CustomElement, ElementFormProps } from '../custom-types'
import { Editor, Transforms, Element as SlateElement, NodeEntry } from 'slate'
import { config as elConfig } from '../config/elements'
import { Overlay, OverlayBody, OverlayToolbar } from '../../Overlay'
import { ReactEditor, useSlate } from 'slate-react'
import { toTitle } from './helpers/text'
import { css } from 'glamor'
import { getAncestry } from './helpers/tree'

const styles = {
  elementTitle: css({
    marginBottom: 5,
  }),
  elementForm: css({
    marginBottom: 20,
  }),
}

const FormContext = createContext([])

export const useFormContext = () => useContext(FormContext)

export const FormContextProvider = ({ children }) => {
  const [formPath, setFormPath] = useState<number[]>()
  return (
    <FormContext.Provider value={[formPath, setFormPath]}>
      {children}
    </FormContext.Provider>
  )
}

type FormData = {
  Form: React.FC<ElementFormProps<CustomElement>>
  node: NodeEntry<CustomElement>
}

const getForm = (
  editor: CustomEditor,
  node: NodeEntry<CustomElement>,
  skipBlock?: boolean,
): FormData | undefined => {
  const element = node[0]
  // console.log({ element, config: elConfig[element.type] })
  const config = elConfig[element.type]
  if (skipBlock && config.attrs?.blockUi) return
  const Form = config.Form
  if (!Form) return
  return {
    node,
    Form,
  }
}

export const getForms = (editor: CustomEditor, path: number[]): FormData[] => {
  if (!path || path === []) return []

  const node = Editor.node(editor, path)
  const { convertContainer } = getAncestry(editor, node)
  const topLevelNode = convertContainer || node

  if (!SlateElement.isElement(topLevelNode[0])) return []

  let forms: FormData[] = []
  for (const [n, p] of Editor.nodes(editor, {
    match: SlateElement.isElement,
    at: path,
  })) {
    const currentForm = getForm(editor, [n, p])
    forms = forms.concat(currentForm)
  }

  return forms.filter(Boolean)
}

const ElementForm: React.FC<FormData & { onClose: () => void }> = ({
  node,
  Form,
  onClose,
}) => {
  const editor = useSlate()
  const nodeEntry = Editor.node(editor, node[1])
  const element = nodeEntry[0] as CustomElement
  return (
    <div {...styles.elementForm}>
      <Form
        element={element}
        path={nodeEntry[1]}
        onChange={(newProperties: Partial<CustomElement>) => {
          Transforms.setNodes(editor, newProperties, {
            at: node[1],
          })
        }}
        onClose={onClose}
      />
    </div>
  )
}

export const FormOverlay = (): ReactElement => {
  const [formPath, setFormPath] = useFormContext()
  const editor = useSlate()
  const forms = useMemo(() => getForms(editor, formPath), [editor, formPath])

  if (!forms.length || !formPath) return null

  const onClose = () => {
    ReactEditor.focus(editor)
    Transforms.select(editor, formPath)
    setFormPath(undefined)
  }

  return (
    <Overlay onClose={onClose}>
      <OverlayToolbar
        title={toTitle(forms[0].node[0].type)}
        onClose={onClose}
      />
      <OverlayBody>
        {forms.map((formData, i) => (
          <ElementForm {...formData} onClose={onClose} key={i} />
        ))}
      </OverlayBody>
    </Overlay>
  )
}
