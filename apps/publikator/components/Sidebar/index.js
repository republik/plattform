import { Children, Component } from 'react'
import { css } from 'glamor'
import { HEADER_HEIGHT, ZINDEX_SIDEBAR } from '../Frame/constants'
import { colors, Label } from '@project-r/styleguide'

export const SIDEBAR_WIDTH = 300

const styles = {
  container: css({
    position: 'fixed',
    top: HEADER_HEIGHT,
    right: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    overflow: 'auto',
    backgroundColor: '#fff',
    borderLeft: `1px solid ${colors.divider}`,
    opacity: 1,
    zIndex: ZINDEX_SIDEBAR,
    // ensure 10px white space for <UIForm>s negative magins
    padding: 10 + 1 * 2, // 1px border

    transition: 'transform 0.2s ease-in-out',
    transform: `translateX(${SIDEBAR_WIDTH}px)`,
    '&.open': {
      transform: 'translateX(0px)',
    },
    '@media print': {
      display: 'none',
    },
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
    paddingBottom: '10px',
    marginBottom: '15px',
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
      !active && onSelect(tabId)
    }}
  >
    {children}
  </Label>
)

export const Tab = ({ active, children }) => {
  return <div>{children}</div>
}

export default class Sidebar extends Component {
  constructor(props, ...args) {
    super(props, ...args)
    this.state = {
      selectedTabId: props.selectedTabId || null,
    }

    this.tabClickHandler = this.tabClickHandler.bind(this)
    this.mouseDownHandler = this.mouseDownHandler.bind(this)
  }

  tabClickHandler(id) {
    this.setState({
      selectedTabId: id,
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.selectedTabId &&
      nextProps.selectedTabId !== this.props.selectedTabId
    ) {
      this.setState({
        selectedTabId: nextProps.selectedTabId,
      })
    }
  }

  mouseDownHandler(event) {
    if (this.props.isDisabled) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  render() {
    const { prependChildren, children, isOpen, isDisabled } = this.props
    const { selectedTabId } = this.state

    const cleanChildren = Children.toArray(children)
      .filter(Boolean)
      .filter((c) => Boolean(c.props))
    const tabProperties = cleanChildren.map((child) => child.props)

    const tabButtons = tabProperties.map(({ tabId, label }) => (
      <TabButton
        key={`sidebar-tab-${tabId}`}
        tabId={tabId}
        onSelect={this.tabClickHandler}
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
}

Sidebar.Tab = Tab
