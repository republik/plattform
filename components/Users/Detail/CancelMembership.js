import React, { Component } from 'react'
import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarClose,
  Interaction,
  Checkbox,
  Field
} from '@project-r/styleguide'
import TextareaAutosize from 'react-autosize-textarea'

import { swissTime } from '../../../lib/utils/formats'

const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)

const getInitialState = () => ({
  isOpen: false,
  immediately: false,
  reason: ''
})

export default class CancelMembership extends Component {
  constructor(props) {
    super(props)
    this.state = getInitialState()

    this.reasonChangeHandler = (_, value) => {
      this.setState(() => ({ reason: value }))
    }

    this.immediatelyChangeHandler = (_, value) => {
      this.setState(() => ({ immediately: value }))
    }

    this.closeHandler = () => {
      this.setState(getInitialState)
    }

    this.submitHandler = () => {
      this.props.onSubmit({
        membershipId: this.props.membership.id,
        reason: this.state.reason,
        immediately: this.state.immediately
      })
      this.setState(getInitialState)
    }
  }

  render() {
    const { isOpen } = this.state
    const { membership } = this.props
    return (
      <div style={{ display: 'inline-block' }}>
        <Button
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          Cancel membership
        </Button>

        {isOpen && (
          <Overlay onClose={this.closeHandler}>
            <OverlayToolbar>
              <OverlayToolbarClose
                onClick={this.closeHandler}
              />
            </OverlayToolbar>
            <OverlayBody>
              <Interaction.H2>
                Membership canceln
              </Interaction.H2>
              <br />
              <Interaction.P>
                #{membership.sequenceNumber} –{' '}
                {membership.type.name.split('_').join(' ')}{' '}
                –{' '}
                {dateTimeFormat(
                  new Date(membership.createdAt)
                )}{' '}
                –{' '}
                {(!!membership.renew && 'ACTIVE') ||
                  'INACTIVE'}
              </Interaction.P>
              {membership.periods.map((period, i) => (
                <span key={`period-${i}`}>
                  {dateTimeFormat(
                    new Date(period.beginDate)
                  )}
                  {' - '}
                  {dateTimeFormat(new Date(period.endDate))}
                </span>
              ))}
              <hr />
              <br />
              <Checkbox checked={this.state.immediately} onChange={this.immediatelyChangeHandler}>Sofort canceln?</Checkbox>
              <Field
                value={this.state.reason}
                label={'Grund'}
                onChange={this.reasonChangeHandler}
                renderInput={props => (
                  <TextareaAutosize
                    {...props}
                    style={{ lineHeight: '30px' }}
                  />
                )}
              />
              <Button
                primary
                disabled={!this.state.reason}
                onClick={this.submitHandler}
              >
                Speichern
              </Button>
            </OverlayBody>
          </Overlay>
        )}
      </div>
    )
  }
}
