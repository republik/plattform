import { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import SignIn from '../Auth/SignIn'
import ErrorMessage from '../ErrorMessage'
import { gotoMerci } from './Merci'

import { Loader, Interaction } from '@project-r/styleguide'

const { P } = Interaction

class ClaimPledge extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      error: undefined,
    }
  }
  claim() {
    const { me, id, pkg } = this.props
    const { loading, error } = this.state

    if (loading || error || !me) {
      return
    }
    this.setState(() => ({
      loading: true,
    }))
    this.props
      .claim(id)
      .then(() => {
        gotoMerci({
          id,
          package: pkg,
        })
      })
      .catch((error) => {
        this.setState(() => ({
          loading: false,
          error,
        }))
      })
  }
  componentDidMount() {
    this.claim()
  }
  componentDidUpdate() {
    this.claim()
  }
  render() {
    const { t, me } = this.props

    if (me) {
      const { error } = this.state
      if (error) {
        return <ErrorMessage error={error} />
      } else {
        return <Loader loading message={t('pledge/claim/loading')} />
      }
    }

    return (
      <div>
        <P>{t('pledge/claim/signIn/before')}</P>
        <SignIn
          label={t('pledge/claim/signIn/button')}
          context='pledge'
          acceptedConsents={['PRIVACY']}
        />
      </div>
    )
  }
}

ClaimPledge.propTypes = {
  me: PropTypes.object,
  id: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
}

const claimPledge = gql`
  mutation reclaimPledge($pledgeId: ID!) {
    reclaimPledge(pledgeId: $pledgeId)
  }
`

export default graphql(claimPledge, {
  props: ({ mutate }) => ({
    claim: (pledgeId) =>
      mutate({
        variables: {
          pledgeId,
        },
      }),
  }),
})(ClaimPledge)
