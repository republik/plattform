import React, {
  MouseEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import ReactDOM from 'react-dom'
import { css } from 'glamor'
import { MarkButton } from './Mark'
import { ElementButton } from './Element'
import {
  ButtonI,
  CustomDescendant,
  CustomEditor,
  CustomElement,
  CustomElementsType,
  CustomMarksType,
  CustomText,
  ButtonConfig,
  TemplateType,
  ToolbarMode,
} from '../../../custom-types'
import {
  config as elConfig,
  INLINE_BUTTONS,
  BLOCK_BUTTONS,
} from '../../../config/elements'
import { configKeys as mKeys, MARKS_WHITELIST } from '../../../config/marks'
import { useSlate, ReactEditor, useFocused } from 'slate-react'
import { Editor, Range, NodeEntry } from 'slate'
import { useColorContext } from '../../../../Colors/ColorContext'
import IconButton from '../../../../IconButton'
import { getAncestry } from '../helpers/tree'
import { isEmpty, selectNearestWord } from '../helpers/text'

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
    marginBottom: '15px',
    overflow: 'hidden',
    display: 'flex',
    minHeight: '19px',
    transition: 'opacity 0.75s',
  }),
  buttonGroup: css({
    display: 'flex',
  }),
}

const getInitialButtons = (
  buttons: (TemplateType | CustomMarksType)[],
): ButtonConfig[] =>
  buttons.map((t) => ({
    type: t as CustomElementsType,
    disabled: true,
  }))

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

const noWordSelected = (editor: CustomEditor): boolean =>
  isEmpty(Editor.string(editor, editor.selection)) &&
  !selectNearestWord(editor, true)

const hasVoidSelection = (
  selectedElement?: NodeEntry<CustomElement>,
): boolean => selectedElement && elConfig[selectedElement[0].type].attrs?.isVoid

const getAllowedMarks = (
  editor: CustomEditor,
  showAll: boolean,
  selectedElement?: NodeEntry<CustomElement>,
): ButtonConfig[] => {
  if (!showAll && noWordSelected(editor)) return []
  const allowedMarks =
    selectedElement && elConfig[selectedElement[0].type].attrs?.formatText
      ? mKeys
      : selectedElement
      ? MARKS_WHITELIST
      : []
  const buttons = showAll ? mKeys : allowedMarks
  return buttons.map((t) => ({
    type: t as CustomMarksType,
    disabled: allowedMarks.indexOf(t) === -1, // only useful in fixed mode
  }))
}

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
  showAllInlines: boolean,
  selectedText?: NodeEntry<CustomText>,
  selectedElement?: NodeEntry<CustomElement>,
): ButtonConfig[] => {
  if (!showAllInlines && noWordSelected(editor)) return []

  // make it link icon grey in sticky mode
  const allowedTemplates = noWordSelected(editor)
    ? []
    : getTemplateTypes(selectedText)
  return INLINE_BUTTONS.map((t) => {
    const isSelected = selectedElement && t === selectedElement[0].type
    return {
      type: t as CustomElementsType,
      disabled: !isSelected && allowedTemplates.indexOf(t) === -1,
      active: isSelected,
    }
  })
}

const getAllowedBlocks = (
  editor: CustomEditor,
  showAllBlocks: boolean,
  selectedNode?: NodeEntry<CustomElement>,
  selectedContainer?: NodeEntry<CustomElement>,
): ButtonConfig[] => {
  if (selectedContainer) {
    return getAllowedBlocks(editor, showAllBlocks, selectedContainer)
  }
  const allowedTemplates = getTemplateTypes(selectedNode)
  const blocksToUse = showAllBlocks ? BLOCK_BUTTONS : allowedTemplates
  return blocksToUse.map((t) => {
    const isSelected = selectedNode && t === selectedNode[0].type
    return {
      type: t as CustomElementsType,
      disabled: allowedTemplates.indexOf(t) === -1,
      active: isSelected,
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
  disableWhenActive?: boolean
  title?: string
}> = ({ button, onClick, disabled, active, disableWhenActive, title }) => (
  <IconButton
    disabled={disabled}
    fillColorName={active ? 'primary' : 'text'}
    onMouseDown={(event) => {
      event.preventDefault()
      !disabled && !(disableWhenActive && active) && onClick()
    }}
    Icon={button.icon}
    size={button.small ? 12 : 19}
    title={title}
  />
)

// @Felix check why no pointer cursor on buttons
const ToolbarButtons: React.FC<{
  marks: ButtonConfig[]
  inlines: ButtonConfig[]
  blocks: ButtonConfig[]
}> = ({ marks, inlines, blocks }) => {
  const [colorScheme] = useColorContext()
  return (
    <>
      {marks.map((config) => (
        <MarkButton key={config.type} config={config} />
      ))}
      {inlines.map((config) => (
        <ElementButton key={config.type} config={config} />
      ))}
      {!!marks.length && !!blocks.length && (
        <span
          style={{
            boxSizing: 'border-box',
            marginRight: '20px',
            borderRightWidth: '2px',
            borderRightStyle: 'solid',
          }}
          {...colorScheme.set('borderColor', 'divider')}
        />
      )}
      {blocks.map((config) => (
        <ElementButton key={config.type} config={config} />
      ))}
    </>
  )
}

export const Portal: React.FC<{ children: ReactElement }> = ({ children }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}

const Toolbar: React.FC<{
  containerRef: React.RefObject<HTMLDivElement>
  mode: ToolbarMode
}> = ({ containerRef, mode }) => {
  const [colorScheme] = useColorContext()
  const focused = useFocused()
  const ref = useRef<HTMLDivElement>(null)
  const editor = useSlate()
  const isSticky = mode === 'sticky'

  const [isVisible, setVisible] = useState(false)
  const [marks, setMarks] = useState<ButtonConfig[]>([])
  const [inlines, setInlines] = useState<ButtonConfig[]>([])
  const [blocks, setBlocks] = useState<ButtonConfig[]>([])

  const reset = () => {
    setVisible(false)
    setMarks(isSticky ? getInitialButtons(mKeys) : [])
    setInlines(isSticky ? getInitialButtons(INLINE_BUTTONS) : [])
    setBlocks(isSticky ? getInitialButtons(BLOCK_BUTTONS) : [])
  }

  useEffect(() => {
    if (!focused) {
      reset()
    }
  }, [focused])

  useEffect(() => {
    if (isSticky) return

    const el = ref.current
    if (!el) return

    if (!!marks.length || !!inlines.length || !!blocks.length) {
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

  const setButtons = (text, element, topLevelContainer) => {
    setMarks(getAllowedMarks(editor, isSticky, element))
    setInlines(getAllowedInlines(editor, isSticky, text, element))
    const allowedBlocks = getAllowedBlocks(
      editor,
      isSticky,
      element,
      topLevelContainer,
    )
    setBlocks(allowedBlocks.length >= 2 ? allowedBlocks : [])
  }

  const onChange = (e?: MouseEvent<HTMLDivElement>) => {
    if (!hasSelection(editor) || (!isSticky && !ref.current)) {
      return reset()
    }
    const { text, element, topLevelContainer } = getAncestry(editor)
    if (
      !!element &&
      (isSticky ||
        hasUsableSelection(editor, element) ||
        hasVoidSelection(element))
    ) {
      setButtons(text, element, topLevelContainer)
    } else {
      reset()
    }
  }

  useEffect(() => {
    onChange()
  }, [editor.selection, focused])

  return isSticky ? (
    <div ref={ref} {...styles.stickyToolbar} onClick={(e) => onChange(e)}>
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
