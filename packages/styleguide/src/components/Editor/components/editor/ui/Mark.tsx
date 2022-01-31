import React, { Attributes, ReactElement, useEffect, useRef } from 'react'
import { Editor, Transforms } from 'slate'
import { ReactEditor, useSelected, useSlate } from 'slate-react'
import { config as mConfig, config, configKeys as mKeys, configKeys } from '../../marks'
import { ToolbarButton } from './Toolbar'
import { Placeholder } from './Placeholder'
import { CustomEditor, CustomMarksType, CustomText } from '../../../custom-types'
import { getTextNode } from '../helpers/tree'

const isMarkActive = (editor: CustomEditor, mKey: CustomMarksType): boolean => {
  const marks = Editor.marks(editor)
  return !!marks && !!marks[mKey]
}

const toggleMark = (editor: CustomEditor, mKey: CustomMarksType): void => {
  const isActive = isMarkActive(editor, mKey)
  if (isActive) {
    Editor.removeMark(editor, mKey)
  } else {
    Editor.addMark(editor, mKey, true)
  }
}

const MarkButton: React.FC<{ mKey: CustomMarksType }> = ({ mKey }) => {
  const editor = useSlate()
  const mark = config[mKey]
  if (!mark.button) {
    return null
  }
  return (
    <ToolbarButton
      button={mark.button}
      disabled={!isMarkActive(editor, mKey)}
      onClick={() => toggleMark(editor, mKey)}
    />
  )
}

export const Marks: React.FC = () => (
  <>
    {mKeys
      .filter(mKey => mConfig[mKey]?.button)
      .map(mKey => (
        <MarkButton key={mKey} mKey={mKey} />
      ))}
  </>
)

export const LeafComponent: React.FC<{
  attributes: Attributes
  children: ReactElement
  leaf: CustomText
}> = ({ attributes, children, leaf }) => {
  const selected = useSelected()
  const editor = useSlate()
  const parentPath = ReactEditor.findPath(editor, children.props.parent)
  const parentNode = Editor.node(editor, parentPath)
  const node = getTextNode(parentNode, editor)

  useEffect(() => {
    if (!selected && leaf.text === leaf.placeholder) {
      Transforms.insertText(editor, '', { at: node[1] })
    }
  }, [selected])

  configKeys
    .filter(mKey => leaf[mKey])
    .forEach(mKey => {
      const Component = config[mKey].Component
      children = <Component>{children}</Component>
    })
  return (
    <span {...attributes}>
      {(!leaf.text || leaf.text === ' ') && !leaf.end && (
        <Placeholder node={node} />
      )}
      {children}
    </span>
  )
}
