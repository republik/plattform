import React, {PureComponent} from 'react'
import Button from '../Button'

export {default as Overlay, OverlayRenderer} from './Overlay'
export {OverlayToolbar, OverlayToolbarClose, OverlayToolbarConfirm} from './OverlayToolbar'
export {default as OverlayBody} from './OverlayBody'
export {default as Field} from '../Form/Field'
export {default as Checkbox} from '../Form/Checkbox'
export {Interaction} from '../Typography'

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
    return (
      <div style={{height: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Button primary onClick={this.open}>Open Overlay</Button>
        {this.state.isOpen && this.props.children({onClose: this.close})}
      </div>
    )
  }
}