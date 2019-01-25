import { Component, Fragment } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarClose,
  Interaction,
  Loader
} from '@project-r/styleguide'

import {
  TextButton
} from '../../Display/utils'

const SEND_PAYMENT_REMINDERS = gql`
  mutation sendPaymentReminders(
    $paymentIds: [ID!]!
  ) {
    sendPaymentReminders(paymentIds: $paymentIds)
  }
`

export default class SendPaymentReminders extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false
    }

    this.closeHandler = () => {
      this.setState(() => ({ isOpen: false }))
    }

    this.submitHandler = mutation => () => {
      return mutation({
        variables: {
          paymentIds: [this.props.payment.id]
        }
      }).then(() =>
        this.setState(() => ({ isOpen: false }))
      )
    }
  }

  render() {
    const { isOpen } = this.state
    const { refetchQueries } = this.props
    return (
      <div>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          Zahlungserinnerung
        </TextButton>

        {isOpen && (
          <Mutation
            mutation={SEND_PAYMENT_REMINDERS}
            refetchQueries={refetchQueries}
          >
            {(sendPaymentReminders, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar>
                    <OverlayToolbarClose
                      onClick={this.closeHandler}
                    />
                  </OverlayToolbar>
                  <OverlayBody>
                    <Loader
                      loading={loading}
                      error={error}
                      render={() => (
                        <Fragment>
                          <Interaction.H2>
                            Zahlungserinnerung auslösen?
                          </Interaction.H2>
                          <br />
                          <Button
                            primary
                            onClick={this.submitHandler(
                              sendPaymentReminders
                            )}
                          >
                            Ja
                          </Button>
                        </Fragment>
                      )}
                    />
                  </OverlayBody>
                </Overlay>
              )
            }}
          </Mutation>
        )}
      </div>
    )
  }
}
