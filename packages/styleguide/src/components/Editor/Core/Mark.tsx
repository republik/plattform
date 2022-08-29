import React, {
  Attributes,
  Dispatch,
  ReactElement,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Editor } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { config as mConfig } from '../config/marks'
import { ToolbarButton } from './Toolbar'
import {
  ButtonConfig,
  CustomElement,
  CustomMarksType,
  CustomText,
} from '../custom-types'
import { css, keyframes } from 'glamor'
import {
  isEmpty,
  isMarkActive,
  selectPlaceholder,
  toggleMark,
} from './helpers/text'
import { getTextNode } from './helpers/tree'
import { Marks } from '../Render/Mark'

const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 0.4,
  },
})

const styles = {
  leaf: css({
    position: 'relative',
  }),
  placeholder: css({
    cursor: 'text',
    position: 'absolute',
    left: 0,
    whiteSpace: 'nowrap',
    opacity: 0,
    animation: `0.1s ${fadeIn} 0.1s forwards`,
  }),
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
      title={`toggle ${config.type}`}
      button={mark.button}
      disabled={config.disabled}
      active={isMarkActive(editor, mKey)}
      onClick={() => toggleMark(editor, mKey)}
    />
  )
}

const Placeholder: React.FC<{
  setStyle: Dispatch<any>
  text: string
  parent: CustomElement
}> = ({ text, setStyle, parent }) => {
  const editor = useSlate()
  const placeholderRef = useRef<HTMLSpanElement>()

  useEffect(() => {
    setStyle({
      width: placeholderRef.current?.getBoundingClientRect().width,
      display: 'inline-block',
    })
    return () => {
      setStyle({})
    }
  }, [])

  const onClick = (e: MouseEvent<HTMLSpanElement>) => {
    const parentPath = ReactEditor.findPath(editor, parent)
    const parentNode = Editor.node(editor, parentPath)
    const node = getTextNode(parentNode, editor)
    selectPlaceholder(editor, node)
    return e
  }

  return (
    <span
      ref={placeholderRef}
      {...styles.placeholder}
      style={{ userSelect: 'none' }}
      contentEditable={false}
      onClick={onClick}
    >
      {text}
    </span>
  )
}

export const LeafComponent: React.FC<{
  attributes: Attributes
  children: ReactElement
  leaf: CustomText
}> = ({ attributes, children, leaf }) => {
  const [placeholderStyle, setPlaceholderStyle] = useState()
  const editor = useSlate()
  const showPlaceholder = isEmpty(leaf.text) && !leaf.end

  return (
    <span {...styles.leaf} style={placeholderStyle} {...attributes}>
      <Marks leaf={leaf} schema={editor.customConfig.schema}>
        {showPlaceholder && (
          <Placeholder
            setStyle={setPlaceholderStyle}
            text={leaf.placeholder}
            parent={children.props.parent}
          />
        )}
        {children}
      </Marks>
    </span>
  )
}
