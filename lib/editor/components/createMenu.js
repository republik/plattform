import Portal from 'react-portal'
import React from 'react'
import PropTypes from 'prop-types'

const getInitialState = props => ({
  menu: false
})

export default marks => {
  class Menu extends React.Component {
    constructor(props) {
      super(props)
      this.state = getInitialState(this.props)
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
          <div className="menu hover-menu">
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
