import * as React from 'react'
import { Component, ComponentClass } from 'react'
import * as PropTypes from 'prop-types'
import { graphql } from 'react-apollo'
import { meQuery } from '../../lib/withMe'
import { compose } from 'redux'

interface AnyObject {
  [key: string]: any
}

class Poller extends Component<AnyObject, AnyObject> {
  public static propTypes = {
    onSuccess: PropTypes.func
  }

  public tick: any
  public tickTimeout: any

  constructor(props: any) {
    super(props)
    const now = new Date().getTime()
    this.state = {
      now,
      start: now
    }
    this.tick = () => {
      clearTimeout(this.tickTimeout)
      this.tickTimeout = setTimeout(() => {
        this.setState(() => ({
          now: new Date().getTime()
        }))
        this.tick()
      }, 1000)
    }
  }
  public componentDidMount() {
    this.props.data.startPolling(1000)
    this.tick()
  }
  public componentDidUpdate() {
    const { data: { me }, onSuccess } = this.props
    if (me) {
      clearTimeout(this.tickTimeout)
      const elapsedMs = this.state.now - this.state.start
      this.props.data.stopPolling()

      if (onSuccess) {
        onSuccess(me, elapsedMs)
      }
    }
  }
  public componentWillUnmount() {
    clearTimeout(this.tickTimeout)
  }
  public render() {
    const { data: { error, me } } = this.props
    if (me) {
      return null
    }

    return (
      <span>
        {!!error &&
          <span>
            <br />
            {error.toString()}
          </span>}
      </span>
    )
  }
}

const WrappedPoller: ComponentClass<AnyObject> = graphql(
  meQuery
)(Poller as ComponentClass<AnyObject>)

export default WrappedPoller
