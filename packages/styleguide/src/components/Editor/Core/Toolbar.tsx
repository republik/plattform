import React, {
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
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
  CharButtonConfig,
} from '../custom-types'
import { config as elConfig, configKeys } from '../config/elements'
import { config as charConfig } from '../config/special-chars'
import { configKeys as mKeys, MARKS_ALLOW_LIST } from '../config/marks'
import { useSlate, ReactEditor, useFocused } from 'slate-react'
import { Editor, NodeEntry } from 'slate'
import { useColorContext } from '../../Colors/ColorContext'
import IconButton from '../../IconButton'
import { getAncestry } from './helpers/tree'
import {
  canFormatText,
  countFormat,
  getCharCount,
  isEmpty,
  selectNearestWord,
} from './helpers/text'
import Scroller from '../../Tabs/Scroller'
import { Label } from '../../Typography'
import { CharButton } from './SpecialChars'

export const EDITOR_TOOLBAR_HEIGHT = 50

const styles = {
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
  charCount: css({
    width: 0,
    overflow: 'visible',
    whiteSpace: 'nowrap',
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

const noWordSelected = (editor: CustomEditor): boolean =>
  isEmpty(Editor.string(editor, editor.selection)) &&
  !selectNearestWord(editor, true)

const getAllowedChars = (
  selectedElement?: NodeEntry<CustomElement>,
): CharButtonConfig[] =>
  charConfig.map((char) => ({
    char,
    disabled: !selectedElement,
  }))

const getAllowedMarks = (
  editor: CustomEditor,
  selectedElement?: NodeEntry<CustomElement>,
): ButtonConfig[] => {
  const allowedMarks = canFormatText(editor, selectedElement)
    ? mKeys
    : selectedElement
    ? MARKS_ALLOW_LIST
    : []
  return mKeys.map((t) => ({
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
  moreSelectedElements?: NodeEntry<CustomElement>[],
): ButtonConfig[] => {
  if (!shown.length && noWordSelected(editor)) return []
  // make it link icon grey in sticky mode
  const allowedTypes = noWordSelected(editor)
    ? []
    : getAllowedTypes(selectedText)
  const buttons = shown.length ? shown.map((b) => b.type) : allowedTypes
  const currentlySelected = [selectedElement, ...moreSelectedElements].filter(
    Boolean,
  )
  return buttons.map((t) => {
    const isSelected = currentlySelected.some((e) => e[0].type === t)
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

export const ToolbarContainer: React.FC<{
  children?: ReactNode
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

const Separator = () => {
  const [colorScheme] = useColorContext()
  return (
    <span
      style={{
        boxSizing: 'border-box',
        marginRight: '20px',
        borderRightWidth: '2px',
        borderRightStyle: 'solid',
      }}
      {...colorScheme.set('borderColor', 'divider')}
    />
  )
}

const ToolbarButtons: React.FC<{
  chars: CharButtonConfig[]
  marks: ButtonConfig[]
  inlines: ButtonConfig[]
  blocks: ButtonConfig[]
}> = ({ chars, marks, inlines, blocks }) => (
  <>
    {marks.map((config) => (
      <MarkButton key={config.type} config={config} />
    ))}
    {inlines.map((config) => (
      <ElementButton key={config.type} config={config} />
    ))}
    <Separator />
    {chars.map((config) => (
      <CharButton key={config.char.type} config={config} />
    ))}
    {!!blocks.length && <Separator />}
    {blocks.map((config) => (
      <ElementButton key={config.type} config={config} />
    ))}
  </>
)

const CharCount = () => {
  const editor = useSlate()
  const charCount = getCharCount(editor.children)
  return (
    <span {...styles.charCount}>
      <Label>{countFormat(charCount)} Zeichen</Label>
    </span>
  )
}

const Toolbar: React.FC = () => {
  const editor = useSlate()
  const config = editor.customConfig.toolbar
  const mode = config?.mode || 'sticky'
  const initialInlineButtons = useMemo(
    () => getElementButtons(editor, true),
    [],
  )
  const initialBlockButtons = []
  const initialMarkButtons = useMemo(() => mKeys.map(asButton), [])
  const initialCharButtons = useMemo(() => getAllowedChars(), [])
  const focused = useFocused()
  const [chars, setChars] = useState<CharButtonConfig[]>([])
  const [marks, setMarks] = useState<ButtonConfig[]>([])
  const [inlines, setInlines] = useState<ButtonConfig[]>([])
  const [blocks, setBlocks] = useState<ButtonConfig[]>([])

  const reset = () => {
    setChars(initialCharButtons)
    setMarks(initialMarkButtons)
    setInlines(initialInlineButtons)
    setBlocks(initialBlockButtons)
  }

  useEffect(() => {
    if (!focused) {
      reset()
    }
  }, [focused])

  const setButtons = (text, element, moreElements, convertContainer) => {
    setChars(getAllowedChars(element))
    setMarks(getAllowedMarks(editor, element))
    setInlines(
      getAllowedInlines(
        editor,
        initialInlineButtons,
        text,
        element,
        moreElements,
      ),
    )
    const allowedBlocks = getAllowedBlocks(
      editor,
      initialBlockButtons,
      element,
      convertContainer,
    )
    setBlocks(allowedBlocks.length >= 2 ? allowedBlocks : [])
  }

  const onChange = (e?: MouseEvent<HTMLDivElement>) => {
    if (!hasSelection(editor)) {
      return reset()
    }
    const { text, element, moreElements, convertContainer } =
      getAncestry(editor)
    if (element) {
      setButtons(text, element, moreElements, convertContainer)
    } else {
      reset()
    }
  }

  useEffect(() => {
    onChange()
  }, [editor.selection, focused])

  return (
    <ToolbarContainer
      mode={mode}
      onClick={(e) => onChange(e)}
      style={config?.style}
      renderLeft={config?.showChartCount && <CharCount />}
    >
      <ToolbarButtons
        chars={chars}
        marks={marks}
        inlines={inlines}
        blocks={blocks}
      />
    </ToolbarContainer>
  )
}

export default Toolbar
