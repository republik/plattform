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
import { Label } from '../../../../Typography'
import Checkbox from '../../../../Form/Checkbox'
import { useSlate } from 'slate-react'
import { Transforms } from 'slate'

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
  return (
    <>
      <div>
        <Label>Beitrag Id{element.repoId ? `: ${element.repoId}` : ''}</Label>
        <RepoSearch
          onChange={({ value }) => {
            onChange({ repoId: value.id })
            if (syncData) {
              const meta = value.latestCommit.document.meta
              Transforms.insertText(editor, meta.title, {
                at: path.concat([1, 0]),
              })
              Transforms.insertText(editor, meta.shortTitle, {
                at: path.concat([1, 1]),
              })
              Transforms.setNodes(
                editor,
                { images: { default: { url: meta.image } } },
                {
                  at: path.concat([0]),
                },
              )
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
          />
        </div>
        <div>
          <ColorPicker
            label='Background Color'
            value={element.backgroundColor}
            onChange={(backgroundColor) => {
              onChange({ backgroundColor })
            }}
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
  props: ['backgroundColor', 'color', 'repoId'],
  defaultProps: {
    backgroundColor: '#000',
    color: '#fff',
  },
  button: { icon: ArticlePreviewIcon },
}
