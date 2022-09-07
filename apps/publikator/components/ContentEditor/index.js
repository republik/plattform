import { withRouter } from 'next/router'
import { flyerSchema, RenderContextProvider } from '@project-r/styleguide'
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
    <RenderContextProvider t={t}>
      {/* The Editor does it's own RenderContextProvider
       * but we also need to do one from the main styleguide entry point
       * cause render components will use that context
       */}
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
    </RenderContextProvider>
  )
}

export default compose(withT, withRouter, withAuthorization(['editor']))(Index)
