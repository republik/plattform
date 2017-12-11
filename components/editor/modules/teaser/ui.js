import { colors, Field, Dropdown, Checkbox, Label, P } from '@project-r/styleguide'
import React from 'react'
import { css } from 'glamor'
import {
  buttonStyles,
  createPropertyForm,
  matchBlock
} from '../../utils'

import { getNewItem } from './'

import { getSubmodules } from './serializer'

import ArrowIcon from 'react-icons/lib/md/swap-vert'
import CloseIcon from 'react-icons/lib/md/close'

import SidebarForm from '../../SidebarForm'
import ImageInput from '../../utils/ImageInput'
import ColorPicker from '../../utils/ColorPicker'
import createOnFieldChange from '../../utils/createOnFieldChange'

import {
  createInsertDragSource,
  createDropTarget,
  createMoveDragSource
} from './dnd'

const textPositions = [
  { value: 'topleft', text: 'Top Left' },
  { value: 'topright', text: 'Top Right' },
  { value: 'bottomleft', text: 'Bottom Left' },
  { value: 'bottomright', text: 'Bottom Right' }
]

const titleSizes = [
  { value: 'medium', text: 'Medium' },
  { value: 'small', text: 'Small' },
  { value: 'large', text: 'Large' },
  { value: 'standard', text: 'Standard' }
]

const kinds = [
  { value: 'editorial', text: 'Editorial' },
  { value: 'meta', text: 'Meta' },
  { value: 'social', text: 'Social' }
]

const styles = {
  uiContainer: css({
    position: 'relative',
    height: 0,
    overflow: 'visible'
  }),
  ui: css({
    position: 'absolute',
    zIndex: 12,
    margin: 0,
    padding: 0,
    top: 0,
    left: 0,
    right: 0,
    height: '0px',
    overflow: 'hidden',
    opacity: 0,
    transition: 'opacity 0.2s'
  }),
  uiOpen: css({
    opacity: 1,
    height: '32px'
  }),
  uiInlineRow: css({
    backgroundColor: colors.divider,
    display: 'inline-block',
    margin: 0
  }),
  uiBlockRow: css({
    height: '32px'
  }),
  uiInner: css({
    position: 'absolute',
    height: '32px',
    left: 0,
    right: 0,
    transition: 'top 0.2s'
  }),
  uiInnerToolbar: css({
    top: -32
  }),
  uiInnerDropZone: css({
    top: 0
  }),
  iconButton: css({
    textAlign: 'center',
    display: 'inline-block',
    height: '32px',
    cursor: 'pointer'
  }),
  dropZone: css({
    display: 'inline-block',
    height: '32px'
  }),
  line: css({
    position: 'absolute',
    margin: 0,
    padding: 0,
    top: 0,
    left: 0,
    right: 0,
    borderTop: `1px dashed ${colors.primary}`
  }),
  dragButton: css(
    buttonStyles.mark,
    {
      position: 'absolute',
      top: 0,
      left: 0
    }
  )
}

export const TeaserButton = options => {
  return ({ children }) => {
    const Component = createInsertDragSource(
      ({ connectDragSource }) =>
      connectDragSource(
        <span
          {...buttonStyles.insert}
          data-disabled={false}
          data-visible
          >
          {options.rule.editorOptions.insertButton}
        </span>
      )
    )
    return (
      <Component getNewItem={getNewItem(options)} />
    )
  }
}

const Form = ({ node, onChange, options }) => {
  return <SidebarForm>
    <Field
      label='URL'
      value={node.data.get('url')}
      onChange={onChange('url')}
  />
    {
      options.includes('textPosition') &&
      <Dropdown
        label='Text-Position'
        items={textPositions}
        value={node.data.get('textPosition')}
        onChange={({value}) => onChange('textPosition', null, value)}
      />
    }
    {
      options.includes('kind') &&
      <Dropdown
        label='Inhaltsbezeichnung'
        items={kinds}
        value={node.data.get('kind')}
        onChange={({value}) => {
          onChange('kind', null, value)
        }}
      />
    }
    {
      options.includes('titleSize') &&
      <Dropdown
        label='Titelgrösse'
        items={titleSizes}
        value={node.data.get('titleSize')}
        onChange={({value}) => {
          onChange('titleSize', null, value)
        }}
      />
    }
    {
      options.includes('center') &&
      <Checkbox
        checked={node.data.get('center')}
        onChange={onChange('center')}
      >
        Text zentriert
      </Checkbox>
    }
    {
      options.includes('reverse') &&
      <Checkbox
        checked={node.data.get('reverse')}
        onChange={onChange('reverse')}
      >
        Titel und Bild wechseln
      </Checkbox>
    }
    {
      options.includes('portrait') &&
      <Checkbox
        checked={node.data.get('portrait')}
        onChange={onChange('portrait')}
      >
        Hochformat
      </Checkbox>
    }
    {
      options.includes('color') &&
      <ColorPicker
        label='Textfarbe'
        value={node.data.get('color')}
        onChange={color => {
          onChange('color', null, color)
        }}
        />
    }
    {
      options.includes('bgColor') &&
      <ColorPicker
        label='Hintergrundfarbe'
        value={node.data.get('bgColor')}
        onChange={color => {
          onChange('bgColor', null, color)
        }}
      />
    }
    {
      options.includes('linkColor') &&
      <ColorPicker
        label='Linkfarbe'
        value={node.data.get('linkColor')}
        onChange={color => {
          onChange('linkColor', null, color)
        }}
      />
    }
    {
      options.includes('image') &&
      <ImageInput
        label='Bild'
        src={node.data.get('image')}
        onChange={onChange('image')}
      />
    }
  </SidebarForm>
}

export const TeaserForm = options => {
  const { TYPE } = options

  const subModules = getSubmodules(options)

  const {
    linkModule
  } = subModules

  const moduleTypes = Object.keys(subModules).map(
    k => subModules[k].TYPE
  )

  return createPropertyForm({
    isDisabled: ({ value }) => {
      const teaser = value.blocks.reduce(
      (memo, node) =>
        memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
      undefined
    )

      return !teaser
    }
  })(
    ({ disabled, onChange, value }) => {
      if (disabled) {
        return null
      }

      const teaser = value.blocks.reduce(
        (memo, node) =>
          memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
        undefined
      )

      const handlerFactory = createOnFieldChange(change => {
        const newTeaser = change.value.document.getDescendant(teaser.key)
        const dataRecipients = newTeaser.filterDescendants(
          n => moduleTypes.includes(n.type)
        )
        const newChange = dataRecipients.reduce(
          (t, node) => {
            if (node.type === linkModule.TYPE) {
              return t.setNodeByKey(
                node.key,
                {
                  data: node.data.set('color', newTeaser.data.get('linkColor'))
                }
              )
            } else {
              return t.setNodeByKey(
                node.key,
                { data: newTeaser.data }
              )
            }
          },
          change
        )
        return onChange(newChange)
      }, value, teaser)

      return <div>
        <Label>Teaser</Label>
        <Form node={teaser} onChange={handlerFactory} options={options.rule.editorOptions.formOptions} />
      </div>
    }
  )
}

const RemoveButton = props =>
  <span {...buttonStyles.mark} {...props}><CloseIcon size={24} /></span>

const MoveButton = props =>
  <span {...buttonStyles.mark} {...props}><ArrowIcon size={24} /></span>

export const TeaserInlineUI = options => createDropTarget(createMoveDragSource(
  ({ connectDragSource, connectDropTarget, remove, dragInProcess, isSelected, nodeKey, isOver, ...props }) => {
    const uiStyles = css(styles.ui, isSelected || dragInProcess ? styles.uiOpen : {})
    const uiInnerStyles = css(
      styles.uiInner,
      dragInProcess
      ? styles.uiInnerDropZone
      : styles.uiInnerToolbar
      )

    const dragSource = connectDragSource(<span><MoveButton /></span>)
    const dropZone = connectDropTarget(
      <div style={{backgroundColor: colors.primary}} {...styles.uiBlockRow} />
    )

    const removeHandler = event => {
      event.preventDefault()
      remove(nodeKey)
    }

    return (
      <div contentEditable={false} {...styles.uiContainer}>
        <div {...uiStyles}>
          <div {...uiInnerStyles}>
            {dropZone}
            <P {...styles.uiInlineRow}>
              <RemoveButton onClick={removeHandler} />
              {dragSource}
            </P>
          </div>
        </div>
      </div>
    )
  }
))
