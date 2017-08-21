import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {graphql} from 'react-apollo'
import {meQuery} from '../../lib/withMe'
import {compose} from 'redux'

class Poller extends Component {
  constructor (props) {
    super(props)
    const now = (new Date()).getTime()
    this.state = {
      now,
      start: now
    }
    this.tick = () => {
      clearTimeout(this.tickTimeout)
      this.tickTimeout = setTimeout(
        () => {
          this.setState(() => ({
            now: (new Date()).getTime()
          }))
          this.tick()
        },
        1000
      )
    }
  }
  componentDidMount () {
    this.props.data.startPolling(1000)
    this.tick()
  }
  componentDidUpdate () {
    const {data: {me}, onSuccess} = this.props
    if (me) {
      clearTimeout(this.tickTimeout)
      const elapsedMs = this.state.now - this.state.start
      this.props.data.stopPolling()

      onSuccess && onSuccess(me, elapsedMs)
    }
  }
  componentWillUnmount () {
    clearTimeout(this.tickTimeout)
  }
  render () {
    const {data: {error, me}} = this.props
    if (me) {
      return null
    }

    return (
      <span>
        {!!error && <span><br />{error.toString()}</span>}
      </span>
    )
  }
}

Poller.propTypes = {
  onSuccess: PropTypes.func
}

export default compose(
  graphql(meQuery)
)(Poller)
