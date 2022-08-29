import React, {
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  useEffect,
  useMemo,
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
} from '../custom-types'
import { config as elConfig, configKeys } from '../config/elements'
import { configKeys as mKeys, MARKS_ALLOW_LIST } from '../config/marks'
import { useSlate, ReactEditor, useFocused } from 'slate-react'
import { Editor, Range, NodeEntry } from 'slate'
import { useColorContext } from '../../Colors/ColorContext'
import IconButton from '../../IconButton'
import { getAncestry } from './helpers/tree'
import { getCharCount, isEmpty, selectNearestWord } from './helpers/text'
import Scroller from '../../Tabs/Scroller'
import { Label } from '../../Typography'

export const EDITOR_TOOLBAR_HEIGHT = 50

const styles = {
  hoveringToolbar: css({
    padding: '8px 7px 6px',
    position: 'absolute',
    zIndex: 20,
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
  topToolbar: css({
    padding: '15px 0',
    minHeight: '19px',
    transition: 'opacity 0.75s',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  }),
  stickyToolbar: css({
    backgroundColor: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    paddingLeft: 20,
    paddingRight: 20,
  }),
  buttonGroup: css({
    display: 'flex',
  }),
}

const asButton = (key: CustomElementsType | CustomMarksType): ButtonConfig => ({
  type: key,
  disabled: true,
})

const getElementButtons = (
  editor: CustomEditor,
  isInline = false,
): ButtonConfig[] =>
  configKeys
    .filter((elKey) => {
      const config = elConfig[elKey]
      return (
        config.button &&
        editor.customConfig.schema[elKey] &&
        (isInline ? config.attrs?.isInline : !config.attrs?.isInline)
      )
    })
    .map(asButton)

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
      ? MARKS_ALLOW_LIST
      : []
  const buttons = showAll ? mKeys : allowedMarks
  return buttons.map((t) => ({
    type: t as CustomMarksType,
    disabled: allowedMarks.indexOf(t) === -1, // only useful in fixed mode
  }))
}

const getAllowedTypes = (
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
  shown: ButtonConfig[],
  selectedText?: NodeEntry<CustomText>,
  selectedElement?: NodeEntry<CustomElement>,
): ButtonConfig[] => {
  if (!shown.length && noWordSelected(editor)) return []
  // make it link icon grey in sticky mode
  const allowedTypes = noWordSelected(editor)
    ? []
    : getAllowedTypes(selectedText)
  const buttons = shown.length ? shown.map((b) => b.type) : allowedTypes
  return buttons.map((t) => {
    const isSelected = selectedElement && t === selectedElement[0].type
    return {
      type: t,
      disabled: !isSelected && allowedTypes.indexOf(t) === -1,
      active: isSelected,
    }
  })
}

const getAllowedBlocks = (
  editor: CustomEditor,
  shown: ButtonConfig[],
  selectedNode?: NodeEntry<CustomElement>,
  selectedContainer?: NodeEntry<CustomElement>,
): ButtonConfig[] => {
  if (selectedContainer) {
    return getAllowedBlocks(editor, shown, selectedContainer)
  }
  const allowedTypes = getAllowedTypes(selectedNode).filter(
    (t) => !elConfig[t]?.attrs?.isInline,
  )
  const buttons = shown.length ? shown.map((b) => b.type) : allowedTypes
  return buttons.map((t) => {
    const isSelected = selectedNode && t === selectedNode[0].type
    return {
      type: t,
      disabled: allowedTypes.indexOf(t) === -1,
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

export const ToolbarContainer: React.FC<{
  onClick?: MouseEventHandler<HTMLDivElement>
  style?: object
  centered?: boolean
  renderLeft?: ReactElement
  mode?: ToolbarMode
}> = ({ onClick, mode, style, centered, children, renderLeft }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      onClick={onClick}
      {...colorScheme.set('background', 'default')}
      {...colorScheme.set('borderBottomColor', 'divider')}
      {...(mode === 'sticky' && styles.stickyToolbar)}
      {...styles.topToolbar}
      style={style}
    >
      <Scroller>
        {!!renderLeft && renderLeft}
        <div
          style={{
            width: 690,
            margin: '0 auto',
            display: 'flex',
            justifyContent: centered ? 'center' : 'left',
          }}
        >
          {children}
        </div>
      </Scroller>
    </div>
  )
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

const CharCount = () => {
  const editor = useSlate()
  const charCount = getCharCount(editor.children)
  return <Label>{charCount} Zeichen</Label>
}

const Toolbar: React.FC<{
  containerRef: React.RefObject<HTMLDivElement>
}> = ({ containerRef }) => {
  const editor = useSlate()
  const config = editor.customConfig.toolbar
  const mode = config?.mode || 'sticky'
  const isOnTop = mode === 'sticky' || mode === 'fixed'
  const initialInlineButtons = useMemo(
    () => (isOnTop ? getElementButtons(editor, true) : []),
    [isOnTop],
  )
  const initialBlockButtons = []
  const initialMarkButtons = useMemo(
    () => (isOnTop ? mKeys.map(asButton) : []),
    [isOnTop],
  )
  const [colorScheme] = useColorContext()
  const focused = useFocused()
  const ref = useRef<HTMLDivElement>(null)

  const [isVisible, setVisible] = useState(false)
  const [marks, setMarks] = useState<ButtonConfig[]>([])
  const [inlines, setInlines] = useState<ButtonConfig[]>([])
  const [blocks, setBlocks] = useState<ButtonConfig[]>([])

  const reset = () => {
    setVisible(false)
    setMarks(initialMarkButtons)
    setInlines(initialInlineButtons)
    setBlocks(initialBlockButtons)
  }

  useEffect(() => {
    if (!focused) {
      reset()
    }
  }, [focused])

  useEffect(() => {
    if (isOnTop) return

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

  const setButtons = (text, element, convertContainer) => {
    setMarks(getAllowedMarks(editor, isOnTop, element))
    setInlines(getAllowedInlines(editor, initialInlineButtons, text, element))
    const allowedBlocks = getAllowedBlocks(
      editor,
      initialBlockButtons,
      element,
      convertContainer,
    )
    setBlocks(allowedBlocks.length >= 2 ? allowedBlocks : [])
  }

  const onChange = (e?: MouseEvent<HTMLDivElement>) => {
    if (!hasSelection(editor) || (!isOnTop && !ref.current)) {
      return reset()
    }
    const { text, element, convertContainer } = getAncestry(editor)
    if (
      !!element &&
      (isOnTop ||
        hasUsableSelection(editor, element) ||
        hasVoidSelection(element))
    ) {
      setButtons(text, element, convertContainer)
    } else {
      reset()
    }
  }

  useEffect(() => {
    onChange()
  }, [editor.selection, focused])

  return isOnTop ? (
    <ToolbarContainer
      mode={mode}
      onClick={(e) => onChange(e)}
      style={config?.style}
      renderLeft={config?.showChartCount && <CharCount />}
    >
      <ToolbarButtons marks={marks} inlines={inlines} blocks={blocks} />
    </ToolbarContainer>
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
