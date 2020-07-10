import React, { Fragment } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { TextButton, displayDate } from '../../Display/utils'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarClose,
  Button,
  Dropdown,
  Field,
  InlineSpinner,
  Interaction
} from '@project-r/styleguide'

const APPEND_PERIOD = gql`
  mutation appendPeriod(
    $id: ID!
    $duration: Int!
    $durationUnit: MembershipTypeInterval!
  ) {
    appendPeriod(id: $id, duration: $duration, durationUnit: $durationUnit) {
      id
      periods {
        id
        beginDate
        endDate
        isCurrent
      }
    }
  }
`

class AppendPeriod extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      duration: 1,
      durationUnit: 'month',
      showForm: false
    }
  }

  render() {
    const { membership } = this.props
    if (!membership.canAppendPeriod) {
      return ''
    }

    const variables = {
      id: membership.id,
      duration: this.state.duration,
      durationUnit: this.state.durationUnit
    }

    const onClose = () => this.setState({ showForm: false })

    return (
      <Mutation mutation={APPEND_PERIOD} variables={variables}>
        {(mutation, { loading }) => {
          const durationUnits = [
            { value: 'day', text: `Tag${this.state.duration > 1 ? 'e' : ''}` },
            {
              value: 'week',
              text: `Woche${this.state.duration > 1 ? 'n' : ''}`
            },
            {
              value: 'month',
              text: `Monat${this.state.duration > 1 ? 'e' : ''}`
            },
            { value: 'year', text: `Jahr${this.state.duration > 1 ? 'e' : ''}` }
          ]

          const ondec =
            this.state.duration > 1 &&
            (() => this.setState({ duration: this.state.duration - 1 || 0 }))

          return (
            <>
              <TextButton
                onClick={() => {
                  !loading && this.setState({ showForm: true })
                }}
              >
                Laufzeit hinzufügen {loading && <InlineSpinner size={18} />}
              </TextButton>
              {this.state.showForm && (
                <Overlay onClose={onClose}>
                  <OverlayToolbar>
                    <OverlayToolbarClose onClick={onClose} />
                  </OverlayToolbar>
                  <OverlayBody>
                    <Interaction.P>
                      #{membership.sequenceNumber} –{' '}
                      {membership.type.name.split('_').join(' ')} – Aktuelles
                      Auslaufdatum: {displayDate(membership.periods[0].endDate)}
                    </Interaction.P>
                    <Interaction.H3 style={{ margin: '20px 0' }}>
                      Zeit hinzufügen
                    </Interaction.H3>
                    <Field
                      label="Betrag"
                      value={this.state.duration}
                      onChange={(_, value) => {
                        if (value.match(/\D/)) {
                          return
                        }
                        const numberValue = parseInt(value, 10)
                        this.setState({ duration: numberValue })
                      }}
                      onInc={() =>
                        this.setState({ duration: this.state.duration + 1 })
                      }
                      onDec={ondec}
                    />
                    <Dropdown
                      label="Einheit"
                      items={durationUnits}
                      value={this.state.durationUnit}
                      onChange={item => {
                        this.setState({ durationUnit: item.value })
                      }}
                    />
                    <Button
                      onClick={() => {
                        mutation()
                        this.setState({ showForm: false })
                      }}
                    >
                      Speichern
                    </Button>
                  </OverlayBody>
                </Overlay>
              )}
            </>
          )
        }}
      </Mutation>
    )
  }
}

export default AppendPeriod
