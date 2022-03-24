/* eslint-disable react/prop-types */
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { css } from 'glamor'
import { Marks } from './Mark'
import { InsertButton } from './Element'
import {
  ButtonI,
  CustomDescendant,
  CustomEditor,
  CustomElement,
  CustomElementsType,
  CustomText,
  InsertButtonConfig,
  TemplateType,
} from '../../../custom-types'
import { config as elConfig } from '../../elements'
import { useSlate, ReactEditor } from 'slate-react'
import { Editor, Range, NodeEntry } from 'slate'
import { useColorContext } from '../../../../Colors/ColorContext'
import IconButton from '../../../../IconButton'
import { getAncestry } from '../helpers/tree'
import { isEmpty } from '../helpers/text'

const IMPLICIT_INLINES: TemplateType[] = ['text', 'break']

const styles = {
  hoveringToolbar: css({
    padding: '8px 7px 6px',
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
    height: 0,
    width: 0,
    overflow: 'hidden',
    marginTop: -6,
    opacity: 0,
    display: 'flex',
    transition: 'opacity 0.75s',
  }),
  stickyToolbar: css({
    marginBottom: '10px',
    overflow: 'hidden',
    display: 'flex',
    minHeight: '19px',
    transition: 'opacity 0.75s',
  }),
  buttonGroup: css({
    display: 'flex',
  }),
}

const hasSelection = (editor: CustomEditor): boolean => {
  const { selection } = editor
  return !!selection && ReactEditor.isFocused(editor)
}

const hasUsableSelection = (
  editor: CustomEditor,
  selectedNode?: NodeEntry<CustomElement>,
): boolean => {
  const { selection } = editor
  return (
    !Range.isCollapsed(selection) ||
    (selectedNode && isEmpty(Editor.string(editor, selectedNode[1])))
  )
}

const hasTextSelection = (editor: CustomEditor): boolean =>
  !isEmpty(Editor.string(editor, editor.selection))

const hasVoidSelection = (
  selectedElement?: NodeEntry<CustomElement>,
): boolean => selectedElement && elConfig[selectedElement[0].type].attrs?.isVoid

const showMarks = (
  editor: CustomEditor,
  selectedElement?: NodeEntry<CustomElement>,
): boolean =>
  hasTextSelection(editor) &&
  selectedElement &&
  elConfig[selectedElement[0].type].attrs?.formatText

const getTemplateTypes = (
  nodeEntry?: NodeEntry<CustomDescendant>,
): TemplateType[] => {
  if (!nodeEntry) return []
  const node = nodeEntry[0]
  const template = node.template
  if (!template || !template.type) return []
  return Array.isArray(template.type) ? template.type : [template.type]
}

const getAllowedInlines = (
  editor: CustomEditor,
  selectedNode?: NodeEntry<CustomText>,
): InsertButtonConfig[] => {
  if (!hasTextSelection(editor)) return []
  const templateTypes = getTemplateTypes(selectedNode)
  // console.log('getAllowedInlines', { selectedNode, templateTypes })
  return templateTypes
    .filter((t: TemplateType) => IMPLICIT_INLINES.indexOf(t) === -1)
    .map((t) => ({ type: t as CustomElementsType }))
}

const getAllowedBlocks = (
  editor: CustomEditor,
  selectedNode?: NodeEntry<CustomElement>,
  selectedContainer?: NodeEntry<CustomElement>,
): InsertButtonConfig[] => {
  if (selectedContainer) {
    return getAllowedBlocks(editor, selectedContainer)
  }
  const templateTypes = getTemplateTypes(selectedNode)
  const isInline = elConfig[selectedNode[0].type].attrs?.isInline
  return templateTypes.map((t) => {
    const isSelected = selectedNode && t === selectedNode[0].type
    return {
      type: t as CustomElementsType,
      disabled: !isInline && isSelected,
      active: isInline && isSelected,
    }
  })
}

const calcHoverPosition = (
  element: HTMLDivElement,
  container: HTMLDivElement | null,
): {
  top?: number
  left?: number
} => {
  let rect
  try {
    rect = window.getSelection()?.getRangeAt(0)?.getBoundingClientRect()
  } catch (e) {
    return {}
  }
  if (!rect) return {}
  // console.log({ rect, element: { offsetHeight: element.offsetHeight } })
  const top = rect.top + window.pageYOffset - element.offsetHeight
  const centered = rect.left - element.offsetWidth / 2 + rect.width / 2
  const left = container
    ? Math.min(
        container.getBoundingClientRect().right - // right edge
          element.getBoundingClientRect().width,
        Math.max(
          container.getBoundingClientRect().left, // left edge
          centered,
        ),
      )
    : centered

  return {
    top,
    left,
  }
}

export const ToolbarButton: React.FC<{
  button: ButtonI
  onClick: () => void
  disabled?: boolean
  active?: boolean
}> = ({ button, onClick, disabled, active }) => (
  <IconButton
    fillColorName={disabled ? 'divider' : active ? 'primary' : 'text'}
    onMouseDown={(event) => {
      event.preventDefault()
      onClick()
    }}
    Icon={button.icon}
    size={button.small ? 12 : 19}
  />
)

const ToolbarButtons: React.FC<{
  marks: boolean
  inlines: InsertButtonConfig[]
  blocks: InsertButtonConfig[]
}> = ({ marks, inlines, blocks }) => (
  <>
    {marks && <Marks />}
    {inlines.map((config) => (
      <InsertButton key={config.type} config={config} />
    ))}
    {blocks.map((config) => (
      <InsertButton key={config.type} config={config} />
    ))}
  </>
)

export const Portal: React.FC<{ children: ReactElement }> = ({ children }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}

const Toolbar: React.FC<{
  containerRef: React.RefObject<HTMLDivElement>
  mode: string
}> = ({ containerRef, mode }) => {
  const [colorScheme] = useColorContext()
  const ref = useRef<HTMLDivElement>(null)
  const editor = useSlate()
  const [isVisible, setVisible] = useState(false)
  const [marks, setMarks] = useState(false)
  const [inlines, setInlines] = useState<InsertButtonConfig[]>([])
  const [blocks, setBlocks] = useState<InsertButtonConfig[]>([])
  const isSticky = mode === 'sticky'

  const reset = () => {
    setVisible(false)
    setMarks(false)
    setInlines([])
    setBlocks([])
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isSticky) return
    if (marks || !!inlines.length || !!blocks.length) {
      el.style.opacity = '1'
      el.style.width = 'auto'
      el.style.height = 'auto'
      setTimeout(() => {
        const { top, left } = calcHoverPosition(el, containerRef.current)
        // console.log({ top, left })
        el.style.left = `${left}px`
        el.style.top = `${top}px`
        setVisible(true)
      }, 0)
    } else {
      el.removeAttribute('style')
      setVisible(false)
    }
  })

  useEffect(() => {
    const el = ref.current
    if (!el || !hasSelection(editor)) {
      return reset()
    }
    const { text, element, container } = getAncestry(editor)
    console.log({ text, element, container })
    if (
      !!element &&
      (hasUsableSelection(editor, element) || hasVoidSelection(element))
    ) {
      setMarks(showMarks(editor, element))
      setInlines(getAllowedInlines(editor, text))
      const allowedBlocks = getAllowedBlocks(editor, element, container)
      setBlocks(allowedBlocks.length >= 2 ? allowedBlocks : [])
    } else {
      reset()
    }
  }, [editor.selection])

  return isSticky ? (
    <div ref={ref} {...styles.stickyToolbar}>
      <ToolbarButtons marks={marks} inlines={inlines} blocks={blocks} />
    </div>
  ) : (
    <Portal>
      <div
        ref={ref}
        {...styles.hoveringToolbar}
        {...(isVisible && colorScheme.set('backgroundColor', 'overlay'))}
        {...(isVisible && colorScheme.set('boxShadow', 'overlayShadow'))}
      >
        <ToolbarButtons marks={marks} inlines={inlines} blocks={blocks} />
      </div>
    </Portal>
  )
}

export default Toolbar
