import { withRouter } from 'next/router'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import {
  Editor,
  flyerSchema,
  colors,
  Interaction,
  A,
} from '@project-r/styleguide'
import withAuthorization from '../../components/Auth/withAuthorization'
import Frame from '../../components/Frame'
import { useState } from 'react'
import { HEADER_HEIGHT } from '../../components/Frame/constants'
import SettingsIcon from 'react-icons/lib/fa/cogs'
import CommitButton from '../../components/VersionControl/CommitButton'
import { SIDEBAR_ICON_SIZE } from '../repo/edit'
import Sidebar from '../../components/Sidebar'
import CharCount from '../../components/CharCount'
import VersionControl from '../../components/VersionControl'
import { Link } from '../../lib/routes'

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

const Index = () => {
  const [value, setValue] = useState(INITIAL_VALUE)
  const [showSidebar, setShowSidebar] = useState(true)

  return (
    <Frame raw>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav>
            <span {...styles.navLink}>Document</span>
            <span {...styles.navLink}>
              <Link route='flyer/preview' passHref>
                <A>History</A>
              </Link>
            </span>
          </Frame.Nav>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <div
            style={{
              padding: 25,
              paddingTop: 30,
              // 1 px header border
              paddingBottom: HEADER_HEIGHT - SIDEBAR_ICON_SIZE - 30 - 1,
              cursor: 'pointer',
              color: showSidebar ? colors.primary : undefined,
            }}
            onMouseDown={() => setShowSidebar(!showSidebar)}
          >
            <SettingsIcon size={SIDEBAR_ICON_SIZE} />
          </div>
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
          config={{ schema: flyerSchema }}
        />
        <Sidebar selectedTabId='workflow' isOpen={showSidebar}>
          <Sidebar.Tab tabId='workflow' label='Workflow'>
            <div style={{ marginBottom: 10 }}>
              <CharCount value={'TBD'} />
            </div>
            <VersionControl isNew={true} />
          </Sidebar.Tab>
          <Sidebar.Tab tabId='view' label='Ansicht'>
            <A style={{ color: colors.primary }}>Vorschau</A>
            <Interaction.P style={{ marginBottom: 16 }}>Vorschau</Interaction.P>
          </Sidebar.Tab>
        </Sidebar>
      </Frame.Body>
    </Frame>
  )
}

export default compose(withRouter, withAuthorization(['editor']))(Index)
