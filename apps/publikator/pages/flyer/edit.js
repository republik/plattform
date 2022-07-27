import { withRouter } from 'next/router'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import {
  Editor,
  flyerSchema,
  flyerEditorSchema,
  A,
  Label,
} from '@project-r/styleguide'
import withAuthorization from '../../components/Auth/withAuthorization'
import Frame from '../../components/Frame'
import { useState } from 'react'
import { HEADER_HEIGHT } from '../../components/Frame/constants'
import CommitButton from '../../components/VersionControl/CommitButton'
import { Link } from '../../lib/routes'
import { Phase } from '../../components/Repo/Phases'
import withT from '../../lib/withT'

const styles = {
  defaultContainer: css({
    padding: 20,
  }),
  navLink: css({
    paddingRight: 10,
  }),
}

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

const Index = () => {
  const [value, setValue] = useState(INITIAL_VALUE)

  return (
    <Frame raw>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav>
            <span {...styles.navLink}>Document</span>
            <span {...styles.navLink}>
              <Link route='flyer/preview' passHref>
                <A>Vorschau</A>
              </Link>
            </span>
            <span {...styles.navLink}>
              <Link route='repo/tree' passHref>
                <A>Versionen</A>
              </Link>
            </span>
          </Frame.Nav>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <CommitButton isNew={true} />
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <Frame.Me />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw>
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
      </Frame.Body>
    </Frame>
  )
}

export default compose(withRouter, withAuthorization(['editor']))(Index)
