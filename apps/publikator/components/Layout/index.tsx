import { useState } from 'react'
import Image from 'next/image'
import { css } from 'glamor'
import withMe from '../../lib/withMe'
import Sidebar from './sidebar'

const mobilePortrait = '@media only screen and (max-width: 480px)'

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    maxWidth: '100vw',
    overflow: 'hidden',
  }),
  mainContent: css({
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  }),
  main: css({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    marginLeft: 180,
    transition: 'margin-left 0.3s ease',
    [mobilePortrait]: {
      marginLeft: 0,
      padding: 0,
    },
  }),
  mainCollapsed: css({
    marginLeft: 60,
    [mobilePortrait]: {
      marginLeft: 0,
    },
  }),
  content: css({
    flex: 1,
    padding: '20px',
    [mobilePortrait]: {
      padding: '10px',
    },
  }),
}

function Layout({ children, me }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div {...styles.container}>
      <div {...styles.mainContent}>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          me={me}
        />

        <main {...styles.main} {...(!isSidebarOpen && styles.mainCollapsed)}>
          <div {...styles.content}>{children}</div>
        </main>
      </div>
    </div>
  )
}

export default withMe(Layout)
