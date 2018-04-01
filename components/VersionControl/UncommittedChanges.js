import React, { Component, Fragment } from 'react'
import { gql, graphql } from 'react-apollo'
import { css, merge } from 'glamor'
import {
  colors,
  Label,
  Overlay,
  OverlayBody,
  Interaction,
  Button
} from '@project-r/styleguide'
import { compose } from 'redux'
import { getInitials } from '../../lib/utils/name'
import Loader from '../../components/Loader'
import withT from '../../lib/withT'

const styles = {
  container: css({
    display: 'flex',
    flexFlow: 'row wrap',
    fontSize: '11px',
    padding: '3px 0',
    justifyContent: 'space-around'
  }),
  initials: {
    backgroundColor: '#ccc',
    color: '#000',
    cursor: 'default',
    fontSize: 16,
    height: 40,
    lineHeight: '40px',
    margin: '0 4px 4px 0',
    textAlign: 'center',
    textTransform: 'uppercase',
    width: 40
  },
  initialsPlaceholder: {
    backgroundColor: '#fff',
    border: `1px solid ${colors.divider}`
  }
}

const query = gql`
  query repoUncommitted($repoId: ID!) {
    repo(id: $repoId) {
      id
      uncommittedChanges {
        id
        email
        name
      }
    }
  }
`

const uncommittedChangesSubscription = gql`
  subscription onUncommitedChange(
    $repoId: ID!
  ) {
    uncommittedChanges(
      repoId: $repoId
    ) {
      repoId
      action
      user {
        id
        email
        name
      }
    }
  }
`

export const withUncommitedChanges = (WrappedComponent) => {
  class UncommittedChanges extends Component {
    componentDidMount () {
      this.subscribe()
    }
    componentDidUpdate () {
      this.subscribe()
    }
    subscribe () {
      if (!this.unsubscribe && this.props.ucData.repo) {
        this.unsubscribe = this.props.ucSubscribe()
      }
    }
    componentWillUnmount () {
      this.unsubscribe && this.unsubscribe()
    }
    render () {
      const {
        ucSubscribe, // ignore
        ucData: { loading, error, repo }, // extract
        ...rest // forward
      } = this.props

      return (
        <Loader loading={loading} error={error} render={() => (
          <WrappedComponent
            uncommittedChanges={repo.uncommittedChanges}
            {...rest} />
        )} />
      )
    }
  }

  return compose(
    graphql(query, {
      props: ({ data }) => {
        return {
          ucData: data,
          ucSubscribe: params => {
            return data.subscribeToMore({
              document: uncommittedChangesSubscription,
              variables: {
                repoId: data.repo.id
              },
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) {
                  console.warn('empty subscription data')
                  return prev
                }
                let uncommittedChanges = prev.repo.uncommittedChanges
                const action = subscriptionData.data.uncommittedChanges.action
                if (action === 'create') {
                  const newUser = subscriptionData.data.uncommittedChanges.user
                  if (!uncommittedChanges.find(user => user.id === newUser.id)) {
                    uncommittedChanges = uncommittedChanges.concat(
                      newUser
                    )
                  }
                } else if (action === 'delete') {
                  uncommittedChanges = uncommittedChanges.filter(
                    change =>
                      change.id !==
                      subscriptionData.data.uncommittedChanges.user.id
                  )
                }
                return {
                  ...prev,
                  repo: {
                    ...prev.repo,
                    uncommittedChanges
                  }
                }
              }
            })
          }
        }
      }
    })
  )(UncommittedChanges)
}

const TagsCompact = ({uncommittedChanges, t}) => (
  <div {...styles.container}>
    {uncommittedChanges.length
      ? uncommittedChanges.map(user =>
        <span key={user.id} {...css(styles.initials)} title={user.email}>
          {getInitials(user)}
        </span>
      )
      : (
        <span {...merge(styles.initials, styles.initialsPlaceholder)}
          title={t('uncommittedChanges/empty')} />
        )
    }
  </div>
)

const Tags = ({uncommittedChanges}) => (
  <div {...styles.container}>
    {uncommittedChanges.map(user =>
      <div key={user.id} style={{marginRight: 4, textAlign: 'center'}}>
        <div {...css(styles.initials)} style={{display: 'inline-block'}} title={user.email}>
          {getInitials(user)}
        </div><br />
        <Label>
          {user.name}
        </Label>
      </div>
      )
    }
  </div>
)

class Manager extends Component {
  constructor (...args) {
    super(...args)
    this.state = {}
    this.revertHandler = this.revertHandler.bind(this)
  }
  componentDidMount () {
    this.refreshOverlay()
  }
  componentDidUpdate () {
    this.refreshOverlay()
  }
  refreshOverlay () {
    const { uncommittedChanges, hasUncommittedChanges } = this.props
    const { isOpen, suppress } = this.state

    // reset suppress
    if (
      suppress && (
        !hasUncommittedChanges ||
        uncommittedChanges.length <= 1
      )
    ) {
      this.setState({ suppress: false })
      return
    }

    if (
      !isOpen &&
      !suppress &&
      hasUncommittedChanges &&
      uncommittedChanges.length > 1
    ) {
      this.setState({ isOpen: true })
    } else if (
      isOpen && (
        suppress || uncommittedChanges.length <= 1
      )
    ) {
      this.setState({ isOpen: false })
    }
  }
  revertHandler (e) {
    const { t, onRevert } = this.props
    if (window.confirm(t('uncommittedChanges/revert/confirm'))) {
      onRevert(e)
    }
  }
  render () {
    const { uncommittedChanges, t } = this.props

    return (
      <Fragment>
        {this.state.isOpen && (
          <Overlay onClose={() => {}}>
            <OverlayBody>
              <Interaction.P style={{textAlign: 'center'}}>
                {t('uncommittedChanges/warning')}
              </Interaction.P><br />
              <Tags uncommittedChanges={uncommittedChanges} />
              <p>
                <Button primary block onClick={() => { this.setState({suppress: true}) }}>
                  {t('uncommittedChanges/ignore')}
                </Button>
              </p>
              <p>
                <Button block onClick={this.revertHandler}>
                  {t('uncommittedChanges/revert')}
                </Button>
              </p>
            </OverlayBody>
          </Overlay>
        )}
        {!!uncommittedChanges.length && <Fragment>
          <div style={{ textAlign: 'center', fontSize: '14px', marginTop: 7 }}>
            <Label key='label'>{t('uncommittedChanges/title')}</Label>
          </div>
          <TagsCompact uncommittedChanges={uncommittedChanges} t={t} />
        </Fragment>}
      </Fragment>
    )
  }
}

export default compose(
  withT,
  withUncommitedChanges
)(Manager)
