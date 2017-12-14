import React, { Component, cloneElement } from 'react'
import { css } from 'glamor'
import { HEADER_HEIGHT, ZINDEX_SIDEBAR } from '../Frame/constants'
import { colors, Label } from '@project-r/styleguide'

const styles = {
  container: css({
    position: 'fixed',
    top: HEADER_HEIGHT,
    right: 0,
    bottom: 0,
    width: 340,
    overflow: 'auto',
    backgroundColor: '#fff',
    borderLeft: `1px solid ${colors.divider}`,
    opacity: 1,
    zIndex: ZINDEX_SIDEBAR,
    padding: 10,
    boxShadow: `-1px 0px 2px ${colors.divider}`
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
    <div style={{ display: active === true ? 'block' : 'none' }}>
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

  render () {
    const { children } = this.props
    const { selectedTabId } = this.state

    const tabProperties = children.map(
      child => child.props
    )

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

    const tabs = children.map(
      (child) => cloneElement(
          child,
        {
          active: selectedTabId &&
              child.props.tabId === selectedTabId,
          key: `tab-${child.props.tabId}`,
          ...child.props
        }
        )
    )

    return (
      <div {...styles.container}>
        <div {...styles.tabButtonContainer}>
          {tabButtons}
        </div>
        {tabs}
      </div>
    )
  }
}

Sidebar.Tab = Tab
