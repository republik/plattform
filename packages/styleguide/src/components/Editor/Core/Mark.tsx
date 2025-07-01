import React, {
  Attributes,
  Dispatch,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ReactEditor, useSlate } from 'slate-react'
import { config as mConfig } from '../config/marks'
import { ToolbarButton } from './Toolbar'
import { ButtonConfig, CustomMarksType, CustomText } from '../custom-types'
import { css, keyframes } from 'glamor'
import {
  isEmpty,
  isMarkActive,
  selectEmptyParentPath,
  toggleMark,
} from './helpers/text'
import { Marks } from '../Render/Mark'
import { useRenderContext } from '../Render/Context'

const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 0.33,
  },
})

const styles = {
  leaf: css({
    position: 'relative',
    cursor: 'text',
  }),
  placeholder: css({
    cursor: 'text',
    position: 'absolute',
    left: 1,
    whiteSpace: 'nowrap',
    opacity: 0,
    animation: `0.1s ${fadeIn} 0.1s forwards`,
  }),
}

export const MarkButton: React.FC<{
  config: ButtonConfig
}> = ({ config }) => {
  const { t } = useRenderContext()
  const editor = useSlate()
  const mKey = config.type as CustomMarksType
  const mark = mConfig[mKey]
  if (!mark.button) {
    return null
  }
  return (
    <ToolbarButton
      title={t(`editor/mark/${config.type}`)}
      button={mark.button}
      disabled={config.disabled}
      active={isMarkActive(editor, mKey)}
      onClick={() => toggleMark(editor, mKey)}
    />
  )
}

const Placeholder: React.FC<{
  setStyle: Dispatch<any>
  tKey: string
}> = ({ tKey, setStyle }) => {
  const { t } = useRenderContext()
  const placeholderRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setStyle({
      width: placeholderRef.current?.getBoundingClientRect().width,
      display: 'inline-block',
    })
    return () => {
      setStyle({})
    }
  }, [])

  if (!tKey) return null

  return (
    <span
      ref={placeholderRef}
      {...styles.placeholder}
      style={{ userSelect: 'none' }}
      contentEditable={false}
    >
      {t(`editor/placeholder/${tKey}`, undefined, t(`editor/element/${tKey}`))}
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
  const containerRef = useRef(null)

  const selectEmptyText = (e) => {
    if (showPlaceholder) {
      e.preventDefault(e)
      const parentPath = ReactEditor.findPath(
        editor,
        (children.props as any).parent,
      )
      selectEmptyParentPath(editor, parentPath)
    }
  }

  return (
    <span
      {...styles.leaf}
      style={placeholderStyle}
      {...attributes}
      onMouseDown={selectEmptyText}
      ref={containerRef}
    >
      {showPlaceholder && (
        <Placeholder setStyle={setPlaceholderStyle} tKey={leaf.placeholder} />
      )}
      <Marks
        leaf={leaf}
        schema={editor.customConfig.schema}
        editorSchema={editor.customConfig.editorSchema}
      >
        {children}
      </Marks>
    </span>
  )
}
