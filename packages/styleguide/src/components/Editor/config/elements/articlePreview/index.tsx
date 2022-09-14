import React, { useState } from 'react'
import {
  ArticlePreviewElement,
  ElementConfigI,
  ElementFormProps,
} from '../../../custom-types'
import { ArticlePreviewIcon } from '../../../../Icons'
import { css } from 'glamor'
import ColorPicker from '../../../Forms/ColorPicker'
import RepoSearch from '../../../Forms/RepoSearch'
import Checkbox from '../../../../Form/Checkbox'
import { useSlate } from 'slate-react'
import { Transforms } from 'slate'
import { AutoSlugLinkInfo } from '../../../Forms/github'
import { useRenderContext } from '../../../Render/Context'
import { lab } from 'd3-color'

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

const Form: React.FC<ElementFormProps<ArticlePreviewElement>> = ({
  element,
  path,
  onChange,
}) => {
  const { t } = useRenderContext()
  const editor = useSlate()
  const [syncData, setSyncData] = useState<boolean>(true)
  return (
    <>
      <AutoSlugLinkInfo
        value={element.href || ''}
        label={t('metaData/field/href/document')}
      />
      <RepoSearch
        onChange={({ value }) => {
          const href = `https://github.com/${value.id}?autoSlug`
          const meta = value.latestCommit.document.meta
          const formatColor = meta.format?.meta.color
          const colors = formatColor
            ? {
                color: formatColor,
                backgroundColor: getBackgroundColor(formatColor),
              }
            : {}
          onChange({
            href,
            ...colors,
          })
          if (meta.format) {
            Transforms.setNodes(
              editor,
              {
                href: `https://github.com/${meta.format.repoId}?autoSlug`,
                kind: meta.format.meta.kind,
              },
              { at: path.concat([1, 0]) },
            )
            Transforms.insertText(editor, meta.format.meta.title, {
              at: path.concat([1, 0]),
            })
          } else {
            Transforms.unsetNodes(editor, ['href', 'kind'], {
              at: path.concat([1, 0]),
            })
            Transforms.insertText(editor, '', {
              at: path.concat([1, 0]),
            })
          }
          if (syncData) {
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
          }
        }}
      />
      <Checkbox
        checked={syncData}
        onChange={(_, checked) => setSyncData(checked)}
      >
        Titel, Lead und Bild synchen
      </Checkbox>
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
  props: ['backgroundColor', 'color', 'href'],
  button: { icon: ArticlePreviewIcon },
}
