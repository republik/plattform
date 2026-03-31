import { gql } from '@apollo/client'
import { Mutation } from '@apollo/client/react/components'
import { css } from '@republik/theme/css'
import { Component, Fragment } from 'react'
import Textarea from 'react-textarea-autosize'

import { Field, Interaction, Loader } from '@project-r/styleguide'

import { TextButton } from '@/components/Display/utils'
import { Button, SimpleDialog } from '@/components/ui'

const UPDATE_PAYMENT = gql`
  mutation updatePayment(
    $paymentId: ID!
    $status: PaymentStatus!
    $reason: String
  ) {
    updatePayment(paymentId: $paymentId, status: $status, reason: $reason) {
      id
      status
    }
  }
`

export default class UpdatePayment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      reason: '',
    }

    this.reasonChangeHandler = (_, value) => {
      this.setState(() => ({ reason: value }))
    }

    this.closeHandler = () => {
      this.setState(() => ({ isOpen: false }))
    }

    this.submitHandler = (mutation) => () => {
      const { payment } = this.props
      let promise
      if (payment.status === 'WAITING_FOR_REFUND') {
        promise = mutation({
          variables: {
            paymentId: payment.id,
            status: 'REFUNDED',
          },
        })
      } else if (payment.status === 'WAITING') {
        promise = mutation({
          variables: {
            paymentId: payment.id,
            status: 'PAID',
            reason: this.state.reason,
          },
        })
      }

      return promise.then(() =>
        this.setState(() => ({ reason: '', isOpen: false })),
      )
    }
  }

  render() {
    const { isOpen, reason } = this.state
    const { payment, refetchQueries } = this.props
    return (
      <div>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          {payment.status === 'WAITING_FOR_REFUND' && 'Auf REFUNDED setzen'}
          {payment.status === 'WAITING' && 'Auf PAID setzen'}
        </TextButton>

        {isOpen && (
          <Mutation mutation={UPDATE_PAYMENT} refetchQueries={refetchQueries}>
            {(updatePayment, { loading, error }) => {
              return (
                <SimpleDialog
                  onOpenChange={(open) => {
                    if (!open) {
                      this.closeHandler()
                    }
                  }}
                >
                  <Loader
                    loading={loading}
                    error={error}
                    render={() => (
                      <Fragment>
                        <Interaction.H2>Payment aktualisieren</Interaction.H2>
                        {payment.status === 'WAITING' && (
                          <Field
                            label='Grund'
                            value={reason}
                            renderInput={(inputProps) => (
                              <Textarea
                                {...inputProps}
                                className={css({
                                  minHeight: 40,
                                  paddingTop: '7px !important',
                                  paddingBottom: '6px !important',
                                })}
                              />
                            )}
                            onChange={this.reasonChangeHandler}
                          />
                        )}
                        <Button
                          disabled={payment.status === 'WAITING' && !reason}
                          onClick={this.submitHandler(updatePayment)}
                        >
                          {payment.status === 'WAITING_FOR_REFUND' &&
                            'Auf REFUNDED setzen.'}
                          {payment.status === 'WAITING' && 'Auf PAID setzen.'}
                        </Button>
                      </Fragment>
                    )}
                  />
                </SimpleDialog>
              )
            }}
          </Mutation>
        )}
      </div>
    )
  }
}
