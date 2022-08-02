import { withRouter } from 'next/router'
import { compose } from 'react-apollo'
import {
  Editor,
  flyerSchema,
  flyerEditorSchema,
  useDebounce,
} from '@project-r/styleguide'
import withAuthorization from '../../components/Auth/withAuthorization'
import { useEffect, useMemo, useState } from 'react'
import { HEADER_HEIGHT } from '../Frame/constants'
import { Phase } from '../Repo/Phases'
import { CONTENT_KEY } from '../Edit'

const INITIAL_VALUE = [
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

const PhaseSummary = () => (
  <div>
    <Phase phase={{ label: 'Peer', color: 'gold' }} />
  </div>
)

const toString = (array) => JSON.stringify({ children: array })

const Index = ({ store, reference = INITIAL_VALUE }) => {
  const [value, setValue] = useState(
    reference || store.get(CONTENT_KEY) || INITIAL_VALUE,
  )
  const [debouncedValue] = useDebounce(value, 500)

  const referenceString = useMemo(() => toString(reference), [reference])

  useEffect(() => {
    const compString = toString(debouncedValue)
    if (compString !== referenceString) {
      store.set(CONTENT_KEY, debouncedValue)
    } else {
      store.clear()
    }
  }, [debouncedValue])

  return (
    <Editor
      value={value}
      setValue={(newValue) => {
        setValue(newValue)
      }}
      structure={STRUCTURE}
      config={{
        schema: flyerSchema,
        editorSchema: flyerEditorSchema,
        toolbar: {
          ...TOOLBAR,
          alsoRender: <PhaseSummary />,
        },
      }}
    />
  )
}

export default compose(withRouter, withAuthorization(['editor']))(Index)
