import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from '@project-r/styleguide'

export default class Checklist extends Component {
  constructor (props) {
    super(props)
    this.state = this.getInitialState(this.props)
  }

  getInitialState (props) {
    // TODO: Load initial state from backend and persist approvals on change.
    return {
      toolbar: false,
      approvals: {
        cvd1: {
          label: 'CvD initial',
          checked: false
        },
        ad: {
          label: 'Art Director',
          checked: false
        },
        korrektur: {
          label: 'Korrektur',
          checked: false
        },
        cvd2: {
          label: 'CvD final',
          checked: false
        }
      }
    }
  }

  render () {
    return (
      <div>
        {Object.keys(this.state.approvals).map((keyName, keyIndex) =>
          <p key={keyName}>
            <Checkbox
              checked={this.state.approvals[keyName].checked}
              onChange={(_, checked) => {
                let approvals = this.state.approvals
                approvals[keyName].checked = checked
                this.setState({ approvals: approvals })
              }}
            >
              {this.state.approvals[keyName].label}
            </Checkbox>
          </p>
        )}
      </div>
    )
  }
}

Checklist.propTypes = {
  state: PropTypes.object
}
