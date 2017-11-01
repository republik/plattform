import React, {PureComponent} from 'react'
import Button from '../Button'
import Overlay from './Overlay'

export {default as Overlay} from './Overlay'
export {OverlayToolbar, OverlayToolbarClose, OverlayToolbarConfirm} from './OverlayToolbar'

export class OverlayExample extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {isOpen: false}

    this.open = () => {
      this.setState({isOpen: true})
    }
    this.close = () => {
      this.setState({isOpen: false})
    }
  }

  render () {
    const {isOpen} = this.state

    if (isOpen) {
      return (
        <Overlay onClick={this.close}>{this.props.children}</Overlay>
      )
    }

    return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Button primary onClick={this.open}>Open Overlay</Button>
      </div>
    )
  }
}