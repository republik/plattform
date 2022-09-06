import { withRouter } from 'next/router'
import { flyerSchema } from '@project-r/styleguide'
import { Editor, flyerEditorSchema } from '@project-r/styleguide/editor'
import withAuthorization from '../../components/Auth/withAuthorization'
import { HEADER_HEIGHT } from '../Frame/constants'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'

export const getInitialValue = (options) => {
  const date = options?.publishDate
    ? { value: new Date(options.publishDate) }
    : {}
  return [
    {
      type: 'flyerTileOpening',
      children: [
        {
          type: 'flyerDate',
          children: [{ text: '' }],
          ...date,
        },
        {
          type: 'headline',
          children: [
            { text: 'Guten Morgen,' },
            { type: 'break', children: [{ text: '' }] },
            { text: 'schön sind Sie da!' },
          ],
        },
      ],
    },
    {
      type: 'flyerTileClosing',
      children: [
        {
          type: 'headline',
          children: [{ text: 'Bis nachher!' }],
        },
        {
          type: 'flyerSignature',
          children: [
            {
              text: 'Ihre Crew der Republik',
            },
          ],
        },
      ],
    },
  ]
}

const STRUCTURE = [
  {
    type: 'flyerTileOpening',
  },
  {
    type: ['flyerTile', 'flyerTileMeta'],
    repeat: true,
  },
  {
    type: 'flyerTileClosing',
  },
]

export const editorToolbarStyle = { top: HEADER_HEIGHT }

const TOOLBAR = {
  style: editorToolbarStyle,
  showChartCount: true,
}

const Index = ({ value, onChange, readOnly, t }) => {
  return (
    <Editor
      value={value}
      setValue={(newValue) => {
        onChange(newValue)
      }}
      structure={STRUCTURE}
      config={{
        schema: flyerSchema,
        editorSchema: flyerEditorSchema,
        toolbar: TOOLBAR,
        readOnly,
        t,
      }}
    />
  )
}

export default compose(withT, withRouter, withAuthorization(['editor']))(Index)
