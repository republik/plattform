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
import { config as mConfig, configKeys as mKeys } from '../../../config/marks'
import { ToolbarButton } from './Toolbar'
import {
  ButtonConfig,
  CustomElement,
  CustomMarksType,
  CustomText,
  SchemaConfig,
} from '../../../custom-types'
import { css } from 'glamor'
import { useColorContext } from '../../../../Colors/ColorContext'
import {
  isEmpty,
  isMarkActive,
  selectPlaceholder,
  toggleMark,
} from '../helpers/text'
import { getTextNode } from '../helpers/tree'

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
      title={`toggle-${config.type}`}
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
  const [colorScheme] = useColorContext()
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
      {...colorScheme.set('color', 'disabled')}
      style={{ userSelect: 'none' }}
      contentEditable={false}
      onClick={onClick}
    >
      {text}
    </span>
  )
}

const Recurse: React.FC<{
  components?: React.FC[]
}> = ({ children, components = [] }) => {
  if (!components.length) {
    return <>{children}</>
  }
  const [Component, ...rest] = components
  return (
    <Recurse components={rest}>
      <Component>{children}</Component>
    </Recurse>
  )
}

export const Marks: React.FC<{
  leaf: CustomText
  schema: SchemaConfig
}> = ({ children, leaf, schema }) => {
  const mComponents = mKeys
    .filter((mKey) => leaf[mKey])
    .map((mKey) => schema[mConfig[mKey].component])
  return <Recurse components={mComponents}>{children}</Recurse>
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
