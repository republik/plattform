import React, { Component } from 'react'
import { css } from 'glamor'
import { HEADER_HEIGHT, ZINDEX_SIDEBAR } from '../Frame/constants'
import { colors, Label } from '@project-r/styleguide'

const styles = {
  container: css({
    position: 'fixed',
    top: HEADER_HEIGHT,
    right: -340,
    bottom: 0,
    width: 340,
    overflow: 'auto',
    backgroundColor: '#fff',
    borderLeft: `1px solid ${colors.divider}`,
    opacity: 1,
    zIndex: ZINDEX_SIDEBAR,
    padding: 10,
    transition: 'right 0.2s ease',
    '&.open': {
      right: 0
    }
  }),
  tabButtonContainer: css({
    borderBottom: `1px solid ${colors.divider}`,
    paddingBottom: '10px',
    marginBottom: '15px'
  }),
  tabButton: css({
    display: 'inline-block',
    marginRight: '10px',
    cursor: 'pointer',
    '&.active': {
      textDecoration: 'underline'
    }
  }),
  warnings: css({
    padding: 10,
    backgroundColor: colors.error,
    color: '#fff',
    marginBottom: 10
  }),
  warning: css({
    marginBottom: 5
  })
}

export const TabButton = ({ active, tabId, onSelect, children }) => (
  <Label
    {...styles.tabButton}
    className={active ? 'active' : ''}
    onMouseDown={e => { e.preventDefault(); !active && onSelect(tabId) }}
  >
    {children}
  </Label>
)

export const Tab = ({ active, children }) => {
  return (
    <div>
      {children}
    </div>
  )
}

export default class Sidebar extends Component {
  constructor (props, ...args) {
    super(props, ...args)
    this.state = {
      selectedTabId: props.selectedTabId || null
    }

    this.tabClickHandler = this.tabClickHandler.bind(this)
  }

  tabClickHandler (id) {
    this.setState({
      selectedTabId: id
    })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.selectedTabId) {
      this.setState({
        selectedTabId: nextProps.selectedTabId
      })
    }
  }

  render () {
    const { children, isOpen, warnings } = this.props
    const { selectedTabId } = this.state

    const tabProperties = React.Children.toArray(children)
      .filter(Boolean)
      .map(child => child.props)

    const tabButtons = tabProperties.map(
      ({ tabId, label }) => (
        <TabButton
          key={`sidebar-tab-${tabId}`}
          tabId={tabId}
          onSelect={this.tabClickHandler}
          active={selectedTabId === tabId}
        >
          {label}
        </TabButton>
      )
    )

    const activeTab = React.Children.toArray(children).find(
      child => child.props.tabId === selectedTabId
    )

    return (
      <div {...styles.container} className={isOpen ? 'open' : ''}>
        {warnings.length > 0 && <div {...styles.warnings}>
          {warnings.map((message, i) => (
            <div key={i} {...styles.warning}>
              {message}
            </div>
          ))}
        </div>}
        <div {...styles.tabButtonContainer}>
          {tabButtons}
        </div>
        {activeTab}
      </div>
    )
  }
}

Sidebar.Tab = Tab
