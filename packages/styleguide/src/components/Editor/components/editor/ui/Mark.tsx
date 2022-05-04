import React, { Attributes, ReactElement, useMemo, useRef } from 'react'
import { Editor, NodeEntry } from 'slate'
import { useSlate } from 'slate-react'
import { config as mConfig, configKeys as mKeys } from '../../marks'
import { ToolbarButton } from './Toolbar'
import {
  ButtonConfig,
  CustomEditor,
  CustomMarksType,
  CustomText,
} from '../../../custom-types'
import { css } from 'glamor'
import { useColorContext } from '../../../../Colors/ColorContext'
import { isEmpty, selectPlaceholder } from '../helpers/text'

const styles = {
  leaf: css({
    position: 'relative',
  }),
  placeholder: css({
    cursor: 'text',
    position: 'absolute',
    whiteSpace: 'nowrap',
  }),
}

const isMarkActive = (editor: CustomEditor, mKey: CustomMarksType): boolean => {
  const marks = Editor.marks(editor)
  return !!marks && !!marks[mKey]
}

const toggleMark = (editor: CustomEditor, mKey: CustomMarksType): void => {
  const isActive = isMarkActive(editor, mKey)
  if (isActive) {
    console.log('remove')
    Editor.removeMark(editor, mKey)
  } else {
    Editor.addMark(editor, mKey, true)
  }
}

export const MarkButton: React.FC<{
  config: ButtonConfig
}> = ({ config }) => {
  const editor = useSlate()
  const mKey = config.type as CustomMarksType
  const mark = mConfig[mKey]
  if (!mark.button) {
    return null
  }
  return (
    <ToolbarButton
      button={mark.button}
      disabled={config.disabled}
      active={isMarkActive(editor, mKey)}
      onClick={() => toggleMark(editor, mKey)}
    />
  )
}

export const LeafComponent: React.FC<{
  attributes: Attributes
  children: ReactElement
  leaf: CustomText
  node: NodeEntry<CustomText>
}> = ({ attributes, children, leaf, node }) => {
  const [colorScheme] = useColorContext()
  const editor = useSlate()

  const markStyles = mKeys
    .filter((mKey) => leaf[mKey])
    .reduce((acc, mKey) => {
      const mStyle = mConfig[mKey].styles
      return { ...acc, ...mStyle }
    }, {})

  const showPlaceholder = isEmpty(leaf.text) && !leaf.end
  const placeholderRef = useRef<HTMLSpanElement>()

  const placeholderStyle = useMemo(() => {
    const placeholderEl = placeholderRef.current
    if (!placeholderEl || !showPlaceholder) return {}
    return {
      width: placeholderEl.getBoundingClientRect().width,
      display: 'inline-block',
    }
  }, [showPlaceholder])

  return (
    <span
      {...markStyles}
      {...styles.leaf}
      style={placeholderStyle}
      {...attributes}
    >
      {showPlaceholder && (
        <span
          ref={placeholderRef}
          {...styles.placeholder}
          {...colorScheme.set('color', 'disabled')}
          style={{ userSelect: 'none' }}
          contentEditable={false}
          onClick={(e) => {
            selectPlaceholder(editor, node)
            return e
          }}
        >
          {leaf.placeholder}
        </span>
      )}
      {children}
    </span>
  )
}
