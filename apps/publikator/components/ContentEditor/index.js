import { withRouter } from 'next/router'
import { compose } from 'react-apollo'
import { Editor, flyerSchema, flyerEditorSchema } from '@project-r/styleguide'
import withAuthorization from '../../components/Auth/withAuthorization'
import { HEADER_HEIGHT } from '../Frame/constants'

export const INITIAL_VALUE = [
  {
    type: 'flyerTileOpening',
    children: [
      {
        type: 'headline',
        children: [
          { text: 'Guten Morgen,' },
          { type: 'break', children: [{ text: '' }] },
          { text: 'schoen sind Sie da!' },
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

const TOOLBAR = {
  style: { top: HEADER_HEIGHT },
  showChartCount: true,
}

const Index = ({ value, onChange, renderInToolbar }) => {
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
        toolbar: {
          ...TOOLBAR,
          alsoRender: renderInToolbar,
        },
      }}
    />
  )
}

export default compose(withRouter, withAuthorization(['editor']))(Index)
