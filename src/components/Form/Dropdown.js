import React, {PureComponent} from 'react'
import NativeDropdown from './NativeDropdown'
import VirtualDropdown from './VirtualDropdown'

const useVirtual = (() => {
  let ret = undefined
  return () => {
    if (typeof navigator !== 'undefined' && ret === undefined) {
      ret = !(/iPad|iPhone|iPod|android/i.test(navigator.userAgent))
    }
    return ret
  }
})()

class Dropdown extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {useVirtual: false}
  }
  componentDidMount () {
    if (useVirtual()) {
      this.setState({useVirtual: true})
    }
  }
  render () {
    if (this.state.useVirtual) {
      return <VirtualDropdown {...this.props} />
    } else {
      return <NativeDropdown {...this.props} />
    }
  }
}

Dropdown.Native = NativeDropdown
Dropdown.Virtual = VirtualDropdown

export default Dropdown
