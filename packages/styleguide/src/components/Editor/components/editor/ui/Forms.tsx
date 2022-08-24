import React, {
  createContext,
  useContext,
  ReactElement,
  useMemo,
  useState,
} from 'react'
import {
  CustomEditor,
  CustomElement,
  ElementFormProps,
} from '../../../custom-types'
import { Editor, Transforms, Element as SlateElement, NodeEntry } from 'slate'
import { config as elConfig } from '../../../config/elements'
import { Overlay, OverlayBody, OverlayToolbar } from '../../../../Overlay'
import { ReactEditor, useSlate } from 'slate-react'
import { toTitle } from '../helpers/text'
import { css } from 'glamor'

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
  path: number[],
  skipBlock?: boolean,
): FormData | undefined => {
  const node = Editor.node(editor, path)
  const element = node[0]
  // console.log({ element })
  if (!SlateElement.isElement(element)) return
  // console.log({ element, config: elConfig[element.type] })
  const config = elConfig[element.type]
  if (skipBlock && config.attrs?.blockUi) return
  const Form = config.Form
  if (!Form) return
  return {
    node: node as NodeEntry<CustomElement>,
    Form,
  }
}

export const getForms = (editor: CustomEditor, path: number[]): FormData[] => {
  if (!path || path === []) return []
  return path
    .reduce((forms, p, i) => {
      const currentPath = path.slice(0, i ? -i : undefined)
      // console.log({ currentPath })
      const currentForm = getForm(
        editor,
        currentPath,
        currentPath.length !== path.length,
      )
      // console.log({ currentForm })
      return forms.concat(currentForm)
    }, [])
    .filter(Boolean)
    .sort((f1, f2) => {
      const l1 = f1.node[1].length
      const l2 = f2.node[1].length
      return l1 - l2
    })
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
        title={toTitle(forms[forms.length - 1].node[0].type)}
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
