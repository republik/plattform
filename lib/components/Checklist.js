import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { Checkbox } from '@project-r/styleguide'
import { swissTime } from '../utils/format'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const styles = {
  approvedBy: css({
    clear: 'left',
    display: 'block',
    fontSize: '11px',
    lineHeight: '1.3em'
  })
}

export default class Checklist extends Component {
  constructor (props) {
    super(props)
    this.state = this.getInitialState(this.props)
  }

  getInitialState (props) {
    // TODO: Load initial state from backend and persist approvals on change.
    return this.props.state
  }

  onChange (keyName, approvals) {
    this.setState({ approvals: approvals })
    if (this.props.onChange) {
      this.props.onChange(keyName, this.state)
    }
  }

  render () {
    return (
      <div>
        {Object.keys(this.state.approvals).map((keyName, keyIndex) =>
          <p key={keyName}>
            <Checkbox
              checked={this.state.approvals[keyName].checked}
              disabled={this.props.disabled}
              onChange={(_, checked) => {
                let approvals = this.state.approvals
                approvals[keyName].checked = checked
                this.onChange(keyName, approvals)
              }}
            >
              {this.state.approvals[keyName].label}
              {this.state.approvals[keyName].approvedBy &&
                <span {...styles.approvedBy}>
                  {this.state.approvals[keyName].approvedBy}
                </span>}
              {this.state.approvals[keyName].approvedDatetime &&
                <span {...styles.approvedBy}>
                  {timeFormat(
                    new Date(this.state.approvals[keyName].approvedDatetime)
                  )}
                </span>}
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
