import { Children, useEffect, useState } from 'react'
import { css } from 'glamor'
import { HEADER_HEIGHT, ZINDEX_SIDEBAR } from '../Frame/constants'
import { colors, Label } from '@project-r/styleguide'

export const SIDEBAR_WIDTH = 393

const styles = {
  container: css({
    position: 'fixed',
    top: HEADER_HEIGHT,
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    right: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderLeft: `1px solid ${colors.divider}`,
    opacity: 1,
    zIndex: ZINDEX_SIDEBAR,
    minWidth: 0,
    transition: 'transform 0.2s ease-in-out',
    transform: `translateX(${SIDEBAR_WIDTH}px)`,
    '&.open': {
      transform: 'translateX(0px)',
    },
    '@media print': {
      display: 'none',
    },
  }),
  tabContainer: css({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
  }),
  overlay: css({
    opacity: '0.5',
    pointer: 'arrow',
    position: 'absolute',
    backgroundColor: '#fff',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
  tabButtonContainer: css({
    borderBottom: `1px solid ${colors.divider}`,
    padding: '10px 15px',
  }),
  tabButton: css({
    display: 'inline-block',
    marginRight: '10px',
    cursor: 'pointer',
    '&.active': {
      textDecoration: 'underline',
    },
  }),
}

export const TabButton = ({ active, tabId, onSelect, children }) => (
  <Label
    {...styles.tabButton}
    className={active ? 'active' : ''}
    onMouseDown={(e) => {
      e.preventDefault()
      if (!active) {
        onSelect(tabId)
      }
    }}
  >
    {children}
  </Label>
)

export const Tab = ({ children }) => {
  return <div {...styles.tabContainer}>{children}</div>
}

const Sidebar = ({
  selectedTabId: externallySelectedTabId,
  prependChildren,
  children,
  isOpen,
  isDisabled,
}) => {
  const [selectedTabId, setSelectedTabId] = useState(
    externallySelectedTabId || null,
  )

  // necessary because the parent component changes the selectedTabId
  useEffect(() => {
    if (externallySelectedTabId) {
      setSelectedTabId(externallySelectedTabId)
    }
  }, [externallySelectedTabId])

  const cleanChildren = Children.toArray(children)
    .filter(Boolean)
    .filter((c) => Boolean(c.props))
  const tabProperties = cleanChildren.map((child) => child.props)

  const tabButtons = tabProperties.map(({ tabId, label }) => (
    <TabButton
      key={`sidebar-tab-${tabId}`}
      tabId={tabId}
      onSelect={(id) => {
        setSelectedTabId(id)
      }}
      active={selectedTabId === tabId}
    >
      {label}
    </TabButton>
  ))

  const activeTab = cleanChildren
    .filter(Boolean)
    .find((child) => child.props.tabId === selectedTabId)

  return (
    <div {...styles.container} className={(isOpen && 'open') || ''}>
      {prependChildren}
      {isDisabled && (
        <div {...styles.overlay} onMouseDown={(e) => e.preventDefault()} />
      )}
      <div {...styles.tabButtonContainer}>{tabButtons}</div>
      {activeTab}
    </div>
  )
}

Sidebar.Tab = Tab

export default Sidebar
