import { Component, Fragment } from 'react'
import { Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
import Textarea from 'react-textarea-autosize'
import { css } from 'glamor'

import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Interaction,
  Field,
  Loader,
} from '@project-r/styleguide'

import { TextButton } from '../../Display/utils'

const RESOLVE_PLEDGE_TO_PAYMENT = gql`
  mutation resolvePledgeToPayment($pledgeId: ID!, $reason: String!) {
    resolvePledgeToPayment(pledgeId: $pledgeId, reason: $reason) {
      id
      status
    }
  }
`

export default class ResolvePledgeToPayment extends Component {
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
      return mutation({
        variables: {
          pledgeId: this.props.pledge.id,
          reason: this.state.reason,
        },
      }).then(() => this.setState(() => ({ reason: '', isOpen: false })))
    }
  }

  render() {
    const { isOpen, reason } = this.state
    const { refetchQueries } = this.props
    return (
      <div>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          Resolve
        </TextButton>

        {isOpen && (
          <Mutation
            mutation={RESOLVE_PLEDGE_TO_PAYMENT}
            refetchQueries={refetchQueries}
          >
            {(movePledge, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar onClose={this.closeHandler} />
                  <OverlayBody>
                    <Loader
                      loading={loading}
                      error={error}
                      render={() => (
                        <Fragment>
                          <Interaction.H2>Pledge resolven</Interaction.H2>
                          <Field
                            label='Grund'
                            value={reason}
                            renderInput={(inputProps) => (
                              <Textarea
                                {...inputProps}
                                {...css({
                                  minHeight: 40,
                                  paddingTop: '7px !important',
                                  paddingBottom: '6px !important',
                                })}
                              />
                            )}
                            onChange={this.reasonChangeHandler}
                          />
                          <Button
                            primary
                            disabled={!reason}
                            onClick={this.submitHandler(movePledge)}
                          >
                            Speichern
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
