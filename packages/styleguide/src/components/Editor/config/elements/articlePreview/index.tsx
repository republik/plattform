import React from 'react'
import {
  ArticleKind,
  ArticlePreviewElement,
  ArticlePreviewFormatElement,
  ArticlePreviewTextContainerElement,
  ElementConfigI,
  ElementFormProps,
} from '../../../custom-types'
import { ArticlePreviewIcon } from '../../../../Icons'
import { css } from 'glamor'
import ColorPicker from '../../../Forms/ColorPicker'
import RepoSearch from '../../../Forms/RepoSearch'
import { useSlate } from 'slate-react'
import { Transforms } from 'slate'
import { AutoSlugLinkInfo } from '../../../Forms/github'
import { useRenderContext } from '../../../Render/Context'
import { lab } from 'd3-color'
import Dropdown from '../../../../Form/Dropdown'
import Field from '../../../../Form/Field'
import IconButton from '../../../../IconButton'
import { DeleteIcon } from '../../../../Icons'

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: 20,
    width: '100%',
    marginTop: 20,
  }),
}

const getBackgroundColor = (color: string): string => {
  const labColor = lab(color)
  return labColor.l > 50 ? '#000' : '#fff'
}

const RepoField: React.FC<{
  href?: string
  onChange: ({ value: any }) => void
  onDelete: () => void
}> = ({ href, onChange, onDelete }) => {
  const { t } = useRenderContext()
  return (
    <>
      {href ? (
        <>
          <Field
            label='URL'
            value={href}
            disabled
            icon={<IconButton Icon={DeleteIcon} onClick={onDelete} size={30} />}
          />
          <AutoSlugLinkInfo
            value={href || ''}
            label={t('metaData/field/href/document')}
          />
        </>
      ) : (
        <RepoSearch onChange={onChange} />
      )}
    </>
  )
}

const Form: React.FC<ElementFormProps<ArticlePreviewElement>> = ({
  element,
  path,
  onChange,
}) => {
  const editor = useSlate()

  const setFormatData = (format) => {
    const at = path.concat([1, 0])
    Transforms.setNodes(
      editor,
      {
        href: `https://github.com/${format.repoId}?autoSlug`,
      },
      { at },
    )
    Transforms.insertText(editor, format.meta.title, { at })
  }

  const unsetFormatData = () => {
    const at = path.concat([1, 0])
    Transforms.unsetNodes(editor, 'href', { at })
    Transforms.insertText(editor, '', { at })
  }

  const onFormatChange = (format) =>
    format ? setFormatData(format) : unsetFormatData()

  return (
    <>
      <RepoField
        href={element.href}
        onChange={({ value }) => {
          const href = `https://github.com/${value.id}?autoSlug`
          const meta = value.latestCommit.document.meta
          const formatMeta = meta.format?.meta
          const formatColor = formatMeta?.color
          const kind = formatMeta?.kind
          const colors = formatColor
            ? {
                color: formatColor,
                backgroundColor: getBackgroundColor(formatColor),
              }
            : {}
          onChange({
            href,
            kind,
            ...colors,
          })
          onFormatChange(meta.format)
          if (meta.title) {
            Transforms.insertText(editor, meta.title, {
              at: path.concat([1, 1]),
            })
          }
          if (meta.description) {
            Transforms.insertText(editor, meta.description, {
              at: path.concat([1, 2]),
            })
          }
          if (meta.image) {
            Transforms.setNodes(
              editor,
              { images: { default: { url: meta.image } } },
              {
                at: path.concat([0]),
              },
            )
          }
        }}
        onDelete={() => Transforms.unsetNodes(editor, 'href', { at: path })}
      />
      <RepoField
        href={
          (
            (element.children[1] as ArticlePreviewTextContainerElement)
              .children[0] as ArticlePreviewFormatElement
          ).href
        }
        onChange={({ value }) =>
          setFormatData({ value: value.latestCommit.document })
        }
        onDelete={unsetFormatData}
      />
      <Dropdown
        label='Inhaltsbezeichnung'
        items={[
          {
            value: 'editorial',
            text: 'Editorial',
          },
          {
            value: 'meta',
            text: 'Meta',
          },
        ]}
        value={element.kind || 'editorial'}
        onChange={(item) => {
          onChange({ kind: item.value as ArticleKind })
        }}
      />
      <div {...styles.container}>
        <div>
          <ColorPicker
            label='Text Color'
            value={element.color}
            onChange={(color) => {
              onChange({ color })
            }}
            noDelete
          />
        </div>
        <div>
          <ColorPicker
            label='Background Color'
            value={element.backgroundColor}
            onChange={(backgroundColor) => {
              onChange({ backgroundColor })
            }}
            noDelete
          />
        </div>
      </div>
    </>
  )
}

export const config: ElementConfigI = {
  Form,
  structure: [
    { type: 'figureImage' },
    { type: 'articlePreviewTextContainer', main: true },
  ],
  props: ['backgroundColor', 'color', 'href', 'kind'],
  button: { icon: ArticlePreviewIcon },
}
