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
import Field from '../../../../Form/Field'
import { isValidHttpUrl } from '../../../Core/helpers/text'

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: 20,
    width: '100%',
    marginTop: 20,
  }),
}

const Form: React.FC<ElementFormProps<ArticlePreviewElement>> = ({
  element,
  path,
  onChange,
}) => {
  const editor = useSlate()
  const [syncData, setSyncData] = useState<boolean>(true)
  const href = element.href || ''
  return (
    <>
      <div>
        <Field
          label='URL'
          type='url'
          error={
            !!href && !isValidHttpUrl(href) && 'Geben sie eine gültige URL an'
          }
          value={href}
          onChange={(_, value: string) => {
            onChange({
              href: value,
            })
          }}
        />
        <RepoSearch
          onChange={({ value }) => {
            const href = `https://github.com/${value.id}?autoSlug`
            onChange({
              href,
            })
            if (syncData) {
              const meta = value.latestCommit.document.meta
              if (meta.title) {
                Transforms.insertText(editor, meta.title, {
                  at: path.concat([1, 0]),
                })
              }
              if (meta.shortTitle) {
                Transforms.insertText(editor, meta.shortTitle, {
                  at: path.concat([1, 1]),
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
      </div>
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
  defaultProps: {
    backgroundColor: '#000',
    color: '#fff',
  },
  button: { icon: ArticlePreviewIcon },
}
