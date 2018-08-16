import { colors, Field, Dropdown, Checkbox, Label, P } from '@project-r/styleguide'
import React from 'react'
import { css } from 'glamor'
import {
  buttonStyles,
  createPropertyForm,
  matchBlock
} from '../../utils'
import { allBlocks, parent, childIndex, depth } from '../../utils/selection'

import { Block, Text } from 'slate'

import { getNewBlock } from './'

import { getSubmodules } from './serializer'

import ArrowUpIcon from 'react-icons/lib/md/arrow-upward'
import ArrowDownIcon from 'react-icons/lib/md/arrow-downward'
import CloseIcon from 'react-icons/lib/md/close'

import UIForm from '../../UIForm'
import ImageInput from '../../utils/ImageInput'
import ColorPicker from '../../utils/ColorPicker'
import createOnFieldChange from '../../utils/createOnFieldChange'
import RepoSearch from '../../utils/RepoSearch'
import { AutoSlugLinkInfo } from '../../utils/github'

import withT from '../../../../lib/withT'

const textPositions = [
  { value: 'top', text: 'Top' },
  { value: 'middle', text: 'Middle' },
  { value: 'bottom', text: 'Bottom' },
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
  { value: 'scribble', text: 'Ameise' }
]

const styles = {
  uiContainer: css({
    position: 'relative',
    height: 0,
    overflow: 'visible'
  }),
  ui: css({
    position: 'absolute',
    zIndex: 10,
    margin: 0,
    padding: 0,
    top: 0,
    left: 0,
    right: 0,
    height: '0px',
    overflow: 'hidden'
  }),
  uiOpen: css({
    height: 'auto'
  }),
  uiInlineRow: css({
    backgroundColor: '#fff',
    border: `1px solid ${colors.divider}`,
    padding: '5px',
    display: 'inline-block',
    margin: 0
  })
}

const cloneWithRepoData = options => (node, repoData) => {
  const {
    titleModule,
    subjectModule,
    leadModule,
    formatModule,
    paragraphModule,
    linkModule
  } = getSubmodules(options)

  let data = node.data.set('url', `https://github.com/${repoData.id}?autoSlug`)
  const meta = repoData.latestCommit.document.meta

  const formatMeta = meta.format && meta.format.meta
  if (formatMeta) {
    data = data
      .set('color', formatMeta.color)
      .set('kind', formatMeta.kind)
      .set('formatUrl', `https://github.com/${meta.format.repoId}?autoSlug`)
  }

  const credits = paragraphModule.helpers.serializer.fromMdast({
    type: 'paragraph',
    children: meta.credits
  })

  credits.nodes = credits.nodes.map(v => {
    if (v.type === linkModule.TYPE) {
      v.data.color = data.get('color')
    }
    return v
  })

  const res = Block.create({
    type: options.TYPE,
    data,
    nodes: [
      Block.create({
        type: formatModule.TYPE,
        data,
        nodes: [Text.create(formatMeta ? formatMeta.title : '')]
      }),
      Block.create({
        type: titleModule.TYPE,
        data,
        nodes: [Text.create(meta.title)]
      }),
      Block.create({
        type: subjectModule.TYPE,
        data,
        nodes: meta.description
          ? [Text.create(meta.description)]
          : []
      }),
      Block.create({
        type: leadModule.TYPE,
        data,
        nodes: meta.description
          ? [Text.create(meta.description)]
          : []
      }),
      credits
    ]
  })
  return res
}

export const TeaserButton = options => {
  const mouseDownHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    const nodes = allBlocks(value)
      .filter(n => depth(value, n.key) < 2)
      .filter(n => {
        return ['teaser', 'teasergroup'].includes(n.data.get('module'))
      })
    const node = nodes.first()
    if (node) {
      onChange(
        value.change().insertNodeByKey(
          parent(value, node.key).key,
          childIndex(value, node.key),
          getNewBlock(options)()
        )
      )
    }
  }

  return ({ value, onChange }) => {
    const disabled = (
      value.isBlurred ||
      value.isExpanded
    )
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={mouseDownHandler(disabled, value, onChange)}
          >
        {options.rule.editorOptions.insertButtonText}
      </span>
    )
  }
}

const Form = withT(({ node, onChange, onTypeChange, options, t }) => {
  return <UIForm>
    <Field
      label='URL'
      value={node.data.get('url')}
      onChange={onChange('url')} />
    <AutoSlugLinkInfo
      value={node.data.get('url')}
      label={t('metaData/field/href/document')} />
    <Field
      label='Format URL'
      value={node.data.get('formatUrl')}
      onChange={onChange('formatUrl')} />
    <AutoSlugLinkInfo
      value={node.data.get('formatUrl')}
      label={t('metaData/field/href/document')} />
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
        value={node.data.get('color') || '#000'}
        onChange={color => {
          onChange('color', null, color)
        }}
        />
    }
    {
      options.includes('bgColor') &&
      <ColorPicker
        label='Hintergrundfarbe'
        value={node.data.get('bgColor') || '#fff'}
        onChange={color => {
          onChange('bgColor', null, color)
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
    {
      options.includes('byline') &&
      <Field
        label='Bildcredit'
        value={node.data.get('byline')}
        onChange={onChange('byline')} />
    }
    {
      options.includes('showImage') &&
      <Checkbox
        checked={node.data.get('showImage')}
        onChange={onChange('showImage')}
      >
        Bild anzeigen
      </Checkbox>
    }
    {
      options.includes('onlyImage') &&
      <Checkbox
        checked={node.data.get('onlyImage')}
        onChange={onTypeChange}
      >
        Nur Bild
      </Checkbox>
    }
    {
      options.includes('frame') &&
      <Checkbox
        checked={node.data.get('frame')}
        onChange={onChange('frame')}
      >
        Rahmen (Feuilleton)
      </Checkbox>
    }
  </UIForm>
})

export const TeaserForm = ({ subModuleResolver, ...options }) => {
  const { TYPE } = options

  const subModules = subModuleResolver
    ? subModuleResolver(options)
    : getSubmodules(options)

  const {
    linkModule
  } = subModules

  const moduleTypes = Object.keys(subModules).map(
    k => subModules[k].TYPE
  )

  return createPropertyForm({
    isDisabled: ({ value }) => {
      if (matchBlock(`${TYPE}_VOID`)(value.startBlock)) {
        return false
      }

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

      const teaser = matchBlock(`${TYPE}_VOID`)(value.startBlock)
        ? value.startBlock
        : value.blocks.reduce(
            (memo, node) =>
              memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
            undefined
          )

      const handlerFactory = createOnFieldChange(change => {
        const newTeaser = change.value.document.getDescendant(teaser.key)
        const newTeaserData = newTeaser.data.remove('module')
        const dataRecipients = newTeaser.filterDescendants(
          n => moduleTypes.includes(n.type)
        )
        const newChange = dataRecipients.reduce(
          (t, node) => {
            if (linkModule && node.type === linkModule.TYPE) {
              return t.setNodeByKey(
                node.key,
                {
                  data: node.data.set('color', newTeaserData.get('color'))
                }
              )
            } else {
              return t.setNodeByKey(
                node.key,
                { data: newTeaserData }
              )
            }
          },
          change
        )
        return onChange(newChange)
      }, value, teaser)

      const clone = cloneWithRepoData(options)

      const handleRepo = repoData => {
        const newNode = clone(teaser, repoData.value)
        return onChange(
          value.change().replaceNodeByKey(
            teaser.key,
            newNode
          )
        )
      }

      const handleTypeChange = () => {
        return onChange(
          value.change().replaceNodeByKey(
            teaser.key,
            Block.create({
              data: teaser.data.set('onlyImage', !teaser.data.get('onlyImage')),
              type: !teaser.data.get('onlyImage')
                ? `${TYPE}_VOID`
                : TYPE,
              nodes: !teaser.data.get('onlyImage')
                ? []
                : getNewBlock(options)().nodes
            })
          )
        )
      }

      return <div>
        <Label>Teaser</Label>
        <RepoSearch
          value={null}
          label='Von Artikel übernehmen'
          onChange={handleRepo}
        />
        <Form node={teaser} onChange={handlerFactory} onTypeChange={handleTypeChange} options={options.rule.editorOptions.formOptions} />
      </div>
    }
  )
}

const RemoveButton = props =>
  <span {...buttonStyles.mark} {...props}><CloseIcon size={24} /></span>

const MoveUpButton = props =>
  <span {...buttonStyles.mark} {...props}><ArrowUpIcon size={24} /></span>

const MoveDownButton = props =>
  <span {...buttonStyles.mark} {...props}><ArrowDownIcon size={24} /></span>

export const TeaserInlineUI = options =>
({ remove, isSelected, nodeKey, getIndex, getParent, moveUp, moveDown, ...props }) => {
  const uiStyles = css(styles.ui, isSelected ? styles.uiOpen : {})

  const parent = getParent(nodeKey)
  const index = getIndex(nodeKey)
  const isFirstChild = index === 0
  const isLastChild = index === parent.nodes.size - 1
  const isOnlyChild = parent.nodes.size === 1

  const removeHandler = event => {
    event.preventDefault()
    remove(nodeKey)
  }

  const moveUpHandler = event => {
    event.preventDefault()
    moveUp(nodeKey, getParent(nodeKey).key, getIndex(nodeKey))
  }

  const moveDownHandler = event => {
    event.preventDefault()
    moveDown(nodeKey, getParent(nodeKey).key, getIndex(nodeKey))
  }

  return (
    <div contentEditable={false} {...styles.uiContainer}>
      <div contentEditable={false} {...uiStyles}>
        <div>
          <P {...styles.uiInlineRow}>
            {!isOnlyChild && <RemoveButton onMouseDown={removeHandler} />}
            {!isFirstChild && <MoveUpButton onMouseDown={moveUpHandler} />}
            {!isLastChild && <MoveDownButton onMouseDown={moveDownHandler} />}
          </P>
        </div>
      </div>
    </div>
  )
}
