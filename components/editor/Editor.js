import React, { Component } from 'react'
import { Schema, Editor as SlateEditor } from 'slate'
import { css } from 'glamor'
import BasicDocument from './BasicDocument'
import styles from './styles'

const getUI = state => {
  switch (state.getIn(['document', 'data', 'documentType'])) {
    default:
      return BasicDocument
  }
}

const Container = ({ children }) => (
  <div {...css(styles.container)}>{ children }</div>
)

const Sidebar = ({ children }) => (
  <div {...css(styles.sidebar)}>{ children }</div>
)

const Document = ({ children }) => (
  <div {...css(styles.document)}>{ children }</div>
)

const getInitialState = () => ({
  lockedState: null
})

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = getInitialState(props)
    this.changeHandler = this.changeHandler.bind(this)
    this.claimLockHandler = this.claimLockHandler.bind(this)
    this.releaseLockHandler = this.releaseLockHandler.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    this.state = getInitialState(nextProps)
  }

  changeHandler (maybeNextState, shouldNormalize, schema) {
    const { state, onChange, onDocumentChange } = this.props
    const { lockedState } = this.state

    const nextState = shouldNormalize && schema
      ? maybeNextState
        .transform()
        .normalise(
          Schema.create(schema)
        )
      : maybeNextState

    if (!lockedState && state !== nextState) {
      onChange && onChange(nextState)
      if (state.document !== nextState.document) {
        onDocumentChange && onDocumentChange(nextState)
      }
    }
  }

  claimLockHandler (stateToLock) {
    this.setState(
      () => ({
        lockedState: stateToLock
      })
    )
  }

  releaseLockHandler (stateToRelease, shouldNormalize, schema) {
    this.setState(
      () => ({
        lockedState: null

      }),
      () => {
        this.changeHandler(stateToRelease, shouldNormalize, schema)
      }
    )
  }

  render () {
    const { state } = this.props
    const { lockedState } = this.state
    const UI = getUI(state)
    const props = {
      state: lockedState || state,
      onChange: this.changeHandler,
      onClaimLock: this.claimLockHander,
      onReleaseLock: this.releaseLockHander,
      Container,
      Sidebar,
      Document,
      Editor: SlateEditor
    }
    return (
      <UI {...props} />
    )
  }
}

export default Editor
