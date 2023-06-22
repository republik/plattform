import {
  colors,
  Field,
  Dropdown,
  Checkbox,
  Label,
  P,
  useColorContext,
} from '@project-r/styleguide'
import { ColorPicker, RepoSearch } from '@project-r/styleguide/editor'
import { useState } from 'react'
import { css } from 'glamor'
import { buttonStyles, createPropertyForm, matchBlock } from '../../utils'
import { allBlocks, parent, childIndex, depth } from '../../utils/selection'

import shortId from 'shortid'

import { Block, Text } from 'slate'

import { getNewBlock } from './'

import { getSubmodules } from './serializer'

import {
  IconArrowLeft,
  IconArrowRight,
  IconKeyboardArrowUp as ArrowUpIcon,
  IconKeyboardArrowDown as ArrowDownIcon,
  IconClose,
  IconVerticalAlignBottom as MoveToEndIcon,
  IconCheck as Check,
  IconContentCopy as CopyToClipboard,
  IconSubdirectoryArrowRight as MoveIntoIcon,
} from '@republik/icons'

import UIForm from '../../UIForm'
import ImageInput from '../../utils/ImageInput'
import ContrastInfo from '../../utils/ContrastInfo'
import createOnFieldChange from '../../utils/createOnFieldChange'
import { AutoSlugLinkInfo } from '../../utils/github'

import withT from '../../../../lib/withT'
import { stringify } from '@republik/remark-preset'
import copyToClipboard from 'clipboard-copy'

const textPositions = [
  { value: 'top', text: 'Top' },
  { value: 'middle', text: 'Middle' },
  { value: 'bottom', text: 'Bottom' },
  { value: 'topleft', text: 'Top Left' },
  { value: 'topright', text: 'Top Right' },
  { value: 'bottomleft', text: 'Bottom Left' },
  { value: 'bottomright', text: 'Bottom Right' },
  { value: 'underneath', text: 'Underneath' },
]

const titleSizes = [
  { value: 'medium', text: 'Medium' },
  { value: 'small', text: 'Small' },
  { value: 'large', text: 'Large' },
  { value: 'standard', text: 'Standard' },
]

const kinds = [
  { value: 'editorial', text: 'Editorial' },
  { value: 'meta', text: 'Meta' },
  { value: 'scribble', text: 'Ameise' },
]

const styles = {
  uiContainer: css({
    position: 'relative',
    height: 0,
    overflow: 'visible',
  }),
  ui: css({
    position: 'absolute',
    zIndex: 10,
    margin: 0,
    padding: 0,
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  }),
  uiInlineRow: css({
    backgroundColor: '#fff',
    border: `1px solid ${colors.divider}`,
    padding: '5px',
    display: 'inline-block',
    margin: 0,
  }),
}

const cloneWithRepoData = (options) => (node, repoData) => {
  const {
    titleModule,
    subjectModule,
    leadModule,
    formatModule,
    paragraphModule,
    linkModule,
  } = getSubmodules(options)

  let data = node.data.set('url', `https://github.com/${repoData.id}?autoSlug`)
  const meta = repoData.latestCommit.document.meta

  const isArticleTile = node.type === 'ARTICLETILE'
  const formatMeta = meta.format && meta.format.meta
  data = data.set('kind', 'editorial')
  if (formatMeta) {
    data = data
      .set(
        'kind',
        formatMeta.kind === 'feuilleton' ? 'editorial' : formatMeta.kind,
      )
      .set('formatUrl', `https://github.com/${meta.format.repoId}?autoSlug`)
    if (isArticleTile || node.type === 'CAROUSELTILE') {
      data = data.set(
        'formatColor',
        formatMeta.color
          ? formatMeta.color
          : formatMeta.kind
          ? colors[formatMeta.kind]
          : undefined,
      )
    } else {
      data = data.set('color', formatMeta.color)
    }
  }

  let { title, description, credits } = meta
  if (
    node.type === 'CAROUSELTILE' &&
    meta.series &&
    meta.series.episodes.length
  ) {
    data = data.set('count', meta.series.episodes.length)
    title = meta.series.title
    description = ''
    credits = []
  }

  const credit = paragraphModule.helpers.serializer.fromMdast({
    type: 'paragraph',
    children: credits,
  })

  credit.nodes = credit.nodes.map((v) => {
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
        nodes: [Text.create(formatMeta ? formatMeta.title : '')],
      }),
      Block.create({
        type: titleModule.TYPE,
        data,
        nodes: [Text.create(title)],
      }),
      Block.create({
        type: subjectModule.TYPE,
        data: isArticleTile ? data.set('columns', 3) : data,
        nodes: meta.subject ? [Text.create(meta.subject)] : [],
      }),
      Block.create({
        type: leadModule.TYPE,
        data,
        nodes: description ? [Text.create(description)] : [],
      }),
      credit,
    ],
  })

  return res
}

export const TeaserButton = (options) => {
  const mouseDownHandler = (disabled, value, onChange) => (event) => {
    event.preventDefault()
    const nodes = allBlocks(value)
      .filter((n) => depth(value, n.key) < 2)
      .filter((n) => {
        return ['teaser', 'teasergroup'].includes(n.data.get('module'))
      })
    const node = nodes.first()
    if (node) {
      onChange(
        value
          .change()
          .insertNodeByKey(
            parent(value, node.key).key,
            childIndex(value, node.key),
            getNewBlock(options)(),
          ),
      )
    }
  }

  return ({ value, onChange }) => {
    const disabled = value.isBlurred || value.isExpanded
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
  return (
    <UIForm>
      <Field
        label='URL'
        value={node.data.get('url') || ''}
        onChange={onChange('url')}
      />
      <AutoSlugLinkInfo
        value={node.data.get('url')}
        label={t('metaData/field/href/document')}
      />
      {options.includes('formatUrl') && (
        <>
          <Field
            label='Format URL'
            value={node.data.get('formatUrl') || ''}
            onChange={onChange('formatUrl')}
          />
          <AutoSlugLinkInfo
            value={node.data.get('formatUrl')}
            label={t('metaData/field/href/document')}
          />
        </>
      )}
      {options.includes('textPosition') && (
        <Dropdown
          label='Text-Position'
          items={textPositions}
          value={node.data.get('textPosition')}
          onChange={({ value }) => onChange('textPosition', null, value)}
        />
      )}
      {options.includes('kind') && (
        <Dropdown
          label='Inhaltsbezeichnung'
          items={kinds}
          value={node.data.get('kind')}
          onChange={({ value }) => {
            onChange('kind', null, value)
          }}
        />
      )}
      {options.includes('titleSize') && (
        <Dropdown
          label='Titelgrösse'
          items={titleSizes}
          value={node.data.get('titleSize')}
          onChange={({ value }) => {
            onChange('titleSize', null, value)
          }}
        />
      )}
      {options.includes('center') && (
        <Checkbox
          checked={node.data.get('center')}
          onChange={onChange('center')}
        >
          Text zentriert
        </Checkbox>
      )}
      {options.includes('reverse') && (
        <Checkbox
          checked={node.data.get('reverse')}
          onChange={onChange('reverse')}
        >
          Titel und Bild wechseln
        </Checkbox>
      )}
      {options.includes('portrait') && (
        <Checkbox
          checked={node.data.get('portrait')}
          onChange={onChange('portrait')}
        >
          Hochformat
        </Checkbox>
      )}
      {options.includes('color') && options.includes('bgColor') && (
        <ContrastInfo
          color={node.data.get('color')}
          bgColor={node.data.get('bgColor')}
        />
      )}
      {options.includes('color') && (
        <ColorPicker
          label='Textfarbe'
          value={node.data.get('color')}
          onChange={(color) => {
            onChange('color', null, color)
          }}
        />
      )}
      {options.includes('bgColor') && (
        <ColorPicker
          label='Hintergrundfarbe'
          value={node.data.get('bgColor')}
          onChange={(color) => {
            onChange('bgColor', null, color)
          }}
        />
      )}
      {options.includes('outline') && (
        <>
          <Checkbox
            checked={node.data.get('outline') ? true : false}
            onChange={onChange('outline')}
          >
            Mit Umrisslinie
          </Checkbox>
          {node.data.get('outline') && (
            <>
              <br style={{ clear: 'left' }} />
              <ColorPicker
                label='Umrisslinienfarbe'
                value={
                  node.data.get('outline') === true
                    ? undefined
                    : node.data.get('outline')
                }
                onChange={(color) => {
                  onChange('outline', null, color || true)
                }}
              />
            </>
          )}
        </>
      )}
      {options.includes('formatColor') && (
        <ColorPicker
          label='Formatfarbe'
          value={node.data.get('formatColor')}
          onChange={(color) => {
            onChange('formatColor', null, color)
          }}
        />
      )}
      {options.includes('image') && (
        <ImageInput
          label='Bild'
          src={node.data.get('image')}
          onChange={onChange('image')}
        />
      )}
      {options.includes('imageDark') && node.data.get('image') && (
        <>
          <ImageInput
            label={t('metaData/field/srcDark')}
            src={node.data.get('imageDark')}
            onChange={onChange('imageDark')}
            dark
          />
          <Label>{t('metaData/field/srcDark/note')}</Label>
        </>
      )}
      {options.includes('byline') && (
        <Field
          label='Bildcredit'
          value={node.data.get('byline') || ''}
          onChange={onChange('byline')}
        />
      )}
      {options.includes('maxWidth') && (
        <Field
          label='Maximale Breite'
          value={node.data.get('maxWidth') || ''}
          onChange={(_, px) => {
            onChange('maxWidth', null, +px || undefined)
          }}
        />
      )}
      {options.includes('count') && (
        <Field
          label='Anzahl (e.g. Episoden)'
          value={node.data.get('count') || ''}
          onChange={(_, count) => {
            onChange('count', null, +count || undefined)
          }}
        />
      )}
      {options.includes('bigger') && (
        <Checkbox
          checked={node.data.get('bigger') || false}
          onChange={onChange('bigger')}
        >
          Grösser (e.g. Serien)
        </Checkbox>
      )}
      {options.includes('grid') && (
        <Checkbox
          checked={node.data.get('grid') || false}
          onChange={onChange('grid')}
        >
          Grid
        </Checkbox>
      )}
      {options.includes('showImage') && (
        <Checkbox
          checked={node.data.get('showImage')}
          onChange={onChange('showImage')}
        >
          Bild anzeigen
        </Checkbox>
      )}
      {options.includes('onlyImage') && (
        <Checkbox checked={node.data.get('onlyImage')} onChange={onTypeChange}>
          Nur Bild
        </Checkbox>
      )}
      {options.includes('feuilleton') && (
        <Checkbox
          checked={node.data.get('feuilleton')}
          onChange={onChange('feuilleton')}
        >
          Feuilleton
        </Checkbox>
      )}
      {options.includes('formatLogo') && (
        <ImageInput
          label='Format Logo'
          maxWidth={100}
          src={node.data.get('formatLogo')}
          onChange={onChange('formatLogo')}
        />
      )}
    </UIForm>
  )
})

export const TeaserForm = ({ subModuleResolver, ...options }) => {
  const { TYPE } = options

  const subModules = subModuleResolver
    ? subModuleResolver(options)
    : getSubmodules(options)

  const { linkModule } = subModules

  const moduleTypes = Object.keys(subModules)
    .map((k) => subModules[k] && subModules[k].TYPE)
    .filter(Boolean)

  return createPropertyForm({
    isDisabled: ({ value }) => {
      if (matchBlock(`${TYPE}_VOID`)(value.startBlock)) {
        return false
      }

      const teaser = value.blocks.reduce(
        (memo, node) =>
          memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
        undefined,
      )

      return !teaser
    },
  })(({ disabled, onChange, value }) => {
    if (disabled) {
      return null
    }

    const teaser = matchBlock(`${TYPE}_VOID`)(value.startBlock)
      ? value.startBlock
      : value.blocks.reduce(
          (memo, node) =>
            memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
          undefined,
        )

    const handlerFactory = createOnFieldChange(
      (change) => {
        const newTeaser = change.value.document.getDescendant(teaser.key)
        const newTeaserData = newTeaser.data.remove('module')
        const dataRecipients = newTeaser.filterDescendants((n) =>
          moduleTypes.includes(n.type),
        )

        const newChange = dataRecipients.reduce((t, node) => {
          if (linkModule && node.type === linkModule.TYPE) {
            return t.setNodeByKey(node.key, {
              data: node.data.set('color', newTeaserData.get('color')),
            })
          } else {
            return t.setNodeByKey(node.key, { data: newTeaserData })
          }
        }, change)
        return onChange(newChange)
      },
      value,
      teaser,
    )

    const clone = cloneWithRepoData(options)

    const handleRepo = (repoData) => {
      const newNode = clone(teaser, repoData.value)
      return onChange(value.change().replaceNodeByKey(teaser.key, newNode))
    }

    const handleTypeChange = () => {
      return onChange(
        value.change().replaceNodeByKey(
          teaser.key,
          Block.create({
            data: teaser.data.set('onlyImage', !teaser.data.get('onlyImage')),
            type: !teaser.data.get('onlyImage') ? `${TYPE}_VOID` : TYPE,
            nodes: !teaser.data.get('onlyImage')
              ? []
              : getNewBlock(options)().nodes,
          }),
        ),
      )
    }

    const isTile = !!options.rule.editorOptions.teaserType.match(/tile/i)

    const group = parent(value, teaser.key)
    const existingIndex = group.nodes.indexOf(teaser)

    const createMoveNode =
      (diff = 1) =>
      () => {
        onChange(
          value
            .change()
            .moveNodeByKey(
              teaser.key,
              group.key,
              Math.min(Math.max(0, existingIndex + diff), group.nodes.size),
            ),
        )
      }

    return (
      <div>
        <Label>{options.rule.editorOptions.formTitle || 'Teaser'}</Label>
        <br />
        {isTile && (
          <>
            <span
              {...buttonStyles.action}
              data-visible
              data-disabled={existingIndex === 0}
              onMouseDown={createMoveNode(-1)}
            >
              <IconArrowLeft />
            </span>
            {' bewegen '}
            <span
              {...buttonStyles.action}
              data-visible
              data-disabled={existingIndex === group.nodes.size - 1}
              onMouseDown={createMoveNode(+1)}
            >
              <IconArrowRight />
            </span>
          </>
        )}
        {!options.rule.editorOptions.formOptions.includes('noAdapt') && (
          <RepoSearch
            value={null}
            label='Von Artikel übernehmen'
            onChange={handleRepo}
          />
        )}
        <Form
          node={teaser}
          onChange={handlerFactory}
          onTypeChange={handleTypeChange}
          options={options.rule.editorOptions.formOptions}
        />
      </div>
    )
  })
}

const MarkButton = (props) => <span {...buttonStyles.mark} {...props} />

const CopyMdButton = ({ node, serializer }) => {
  const [success, setSuccess] = useState(false)
  const [colorScheme] = useColorContext()
  const copyMd = (event) => {
    event.preventDefault()
    const mdast = serializer.serialize({ document: node })
    const md = stringify({
      type: 'root',
      meta: {},
      children: [mdast],
    })
    copyToClipboard(md).then(() => setSuccess(true))
  }

  return (
    <MarkButton
      onMouseDown={copyMd}
      title={success ? 'Copied to clipboard!' : 'Copy to clipboard'}
    >
      {success ? (
        <Check size={24} {...colorScheme.set('fill', 'primary')} />
      ) : (
        <CopyToClipboard size={24} />
      )}
    </MarkButton>
  )
}

export const TeaserInlineUI = ({
  editor,
  node,
  serializer,
  removable = true,
  copyable = true,
}) => {
  const parentNode = parent(editor.state.value, node.key)
  const index = parentNode.nodes.indexOf(node)

  const isFirstChild = index === 0
  const isLastChild = index === parentNode.nodes.size - 1
  const isOnlyChild = parentNode.nodes.size === 1

  const removeHandler = (event) => {
    event.preventDefault()
    editor.change((t) => t.removeNodeByKey(node.key))
  }

  const moveHandler = (dir) => (event) => {
    event.preventDefault()
    editor.change((t) => t.moveNodeByKey(node.key, parentNode.key, index + dir))
  }

  const endIndex = parentNode.nodes.findIndex((n) => n.data.get('id') === 'end')

  const nextNode = parentNode.nodes.get(index + 1)
  const intoTarget =
    nextNode &&
    nextNode.type === 'CAROUSEL' &&
    node.type !== 'CAROUSEL' &&
    nextNode.nodes.get(1)

  const copyIntoHandler = (event) => {
    event.preventDefault()

    const sourceNodes =
      node.data.get('module') === 'teasergroup' ? node.nodes : [node]

    const template = intoTarget.nodes.get(0)

    editor.change((t) => {
      sourceNodes
        .filter((n) => n.text.trim())
        .forEach((sourceNode) => {
          const data = template.data.merge({
            id: shortId(),
            formatUrl: sourceNode.data.get('url'),
            formatColor: sourceNode.data.get('formatColor'),
            url: sourceNode.data.get('url'),
            image: sourceNode.data.get('image'),
            byline: sourceNode.data.get('byline'),
            kind: sourceNode.data.get('kind'),
          })
          t.insertNodeByKey(
            intoTarget.key,
            0,
            Block.create({
              type: template.type,
              data: data,
              nodes: template.nodes.map((tn, i) => {
                const sourceChild = sourceNode.nodes.get(i)
                return Block.create({
                  type: tn.type,
                  data: data.remove('id').remove('module'),
                  nodes: sourceChild ? sourceChild.toJSON().nodes : [],
                })
              }),
            }),
          )
        })
    })
  }

  return (
    <div contentEditable={false} {...styles.uiContainer}>
      <div contentEditable={false} {...styles.ui}>
        <div>
          <P {...styles.uiInlineRow}>
            {!isOnlyChild && removable && (
              <MarkButton onMouseDown={removeHandler}>
                <IconClose size={24} />
              </MarkButton>
            )}
            {!isFirstChild && (
              <MarkButton onMouseDown={moveHandler(-1)}>
                <ArrowUpIcon size={24} />
              </MarkButton>
            )}
            {!isLastChild && (
              <MarkButton onMouseDown={moveHandler(+1)}>
                <ArrowDownIcon size={24} />
              </MarkButton>
            )}
            {!!intoTarget && intoTarget.nodes.size > 0 && (
              <MarkButton
                onMouseDown={copyIntoHandler}
                title='In die nächste Gruppe kopieren'
              >
                <MoveIntoIcon size={24} />
              </MarkButton>
            )}
            {endIndex !== -1 && index < endIndex && (
              <MarkButton
                onMouseDown={moveHandler(endIndex - index)}
                title='Nach «The End»'
              >
                <MoveToEndIcon size={24} />
              </MarkButton>
            )}
            {copyable && <CopyMdButton node={node} serializer={serializer} />}
          </P>
        </div>
      </div>
    </div>
  )
}
