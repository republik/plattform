import Portal from 'react-portal'
import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  hoverMenu: {
    padding: '8px 7px 6px',
    position: 'absolute',
    zIndex: 1,
    top: '-10000px',
    left: '-10000px',
    marginTop: '-6px',
    opacity: 0,
    backgroundColor: '#999',
    borderColor: '#222',
    borderRadius: '4px',
    transition: 'opacity .75s',
    '& .button': {
      textAlign: 'center',
      display: 'inline-block',
      minWidth: '10px',
      cursor: 'pointer'
    },
    '& .button[data-active="true"]': {
      backgroundColor: '#fff'
    }
  }
}

const getInitialState = props => ({
  menu: false
})

export default marks => {
  class Menu extends React.Component {
    constructor(props) {
      super(props)
      this.state = getInitialState(this.props)
      this.openHandler = this.openHandler.bind(this)
      this.clickMarkHandler = this.clickMarkHandler.bind(
        this
      )
    }

    componentDidMount() {
      this.updateMenu()
    }

    componentDidUpdate() {
      this.updateMenu()
    }

    openHandler(portal) {
      this.setState({ menu: portal.firstChild })
    }

    hasMark(type) {
      const { state } = this.props
      return state.marks.some(mark => mark.type === type)
    }

    clickMarkHandler(e, type) {
      e.preventDefault()
      let { state, onChange } = this.props
      console.log(type)
      state = state.transform().toggleMark(type).apply()

      onChange(state)
    }

    updateMenu() {
      const { menu } = this.state
      const { state } = this.props

      if (!menu) return

      if (
        state.isBlurred ||
        state.isEmpty ||
        !process.browser
      ) {
        menu.removeAttribute('style')
        return
      }
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      menu.style.opacity = 1
      menu.style.top = `${rect.top +
        window.scrollY -
        menu.offsetHeight}px`
      menu.style.left = `${rect.left +
        window.scrollX -
        menu.offsetWidth / 2 +
        rect.width / 2}px`
    }

    renderMarkButton(type, icon) {
      const isActive = this.hasMark(type)
      const onMouseDown = e =>
        this.clickMarkHandler(e, type)

      return (
        <span
          className="button"
          key={type}
          onMouseDown={onMouseDown}
          data-active={isActive}
        >
          <span>
            {icon}
          </span>
        </span>
      )
    }

    render() {
      return (
        <Portal isOpened onOpen={this.openHandler}>
          <div {...css(styles.hoverMenu)}>
            {marks.map(([type, icon]) =>
              this.renderMarkButton(type, icon)
            )}
          </div>
        </Portal>
      )
    }
  }
  Menu.propTypes = {
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  return Menu
}
