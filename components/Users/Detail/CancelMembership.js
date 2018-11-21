import React, { Component } from 'react'
import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarClose,
  Interaction,
  Radio,
  Checkbox,
  Field
} from '@project-r/styleguide'
import TextareaAutosize from 'react-autosize-textarea'

import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

import { swissTime } from '../../../lib/utils/formats'

const getCancellationCategories = gql`
query cancellationCategories {
  cancellationCategories {
    type
    label
  }
}`

const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)

const getInitialState = () => ({
  isOpen: false,
  immediately: false,
  reason: '',
  cancellationType: ''
})

class CancelMembership extends Component {
  constructor (props) {
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
        immediately: this.state.immediately,
        details: {
          reason: this.state.cancellationType,
          type: this.state.cancellationType

        }

      })
      this.setState(getInitialState)
    }
  }

  render () {
    const { isOpen, reason, cancellationType } = this.state
    const { membership, cancellationCategories } = this.props

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
              {cancellationCategories &&
                cancellationCategories.map(({ type, label }) => (
                  <div key={type}>
                    <Radio
                      value={cancellationType}
                      checked={cancellationType === type}
                      onChange={() => this.setState({ cancellationType: type })}
                  >
                      {label}
                    </Radio>
                  </div>)
              )}
              <br />
              <Checkbox checked={this.state.immediately} onChange={this.immediatelyChangeHandler}>Sofort canceln?</Checkbox>
              <Field
                value={reason}
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
                disabled={!cancellationType}
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

export default graphql(getCancellationCategories, {
  props: ({ data }) => data
})(CancelMembership)
