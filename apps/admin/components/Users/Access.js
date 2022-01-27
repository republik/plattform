import { Component, Fragment } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { css } from 'glamor'
import moment from 'moment'

import withT from '../../lib/withT'

import {
  colors,
  Button,
  Interaction,
  InlineSpinner,
  Label,
  HR,
  A,
  Loader
} from '@project-r/styleguide'

import ErrorMessage from '../ErrorMessage'
import List, { Item } from '../List'
import routes from '../../server/routes'

import {
  displayDateTime,
  Section,
  SectionTitle
} from '../Display/utils'

const GET_ACCESS_GRANTS = gql`
query user($id: String) {
  user(slug: $id) {
    id
    accessGrants(withPast: true) {
      id
      status
      createdAt
      beginBefore
      voucherCode
      beginAt
      endAt
      revokedAt
      invalidatedAt
      granter {
        id
        email
        name
      }
      campaign {
        id
        title
        endAt
      }
      events {
        createdAt
        event
      }
    }
    accessCampaigns(withPast: true) {
      id
      title
      endAt
      slots {
        total
        free
        used
      }
      grants(withRevoked: true, withInvalidated: true) {
        id
        status
        createdAt
        beginBefore
        voucherCode
        beginAt
        endAt
        revokedAt
        invalidatedAt
        email
        recipient {
          id
          email
          name
        }
        events {
          createdAt
          event
        }
      }
    }
  }
}
`

const REVOKE_ACCESS = gql`
  mutation revokeAccess(
    $id: ID!
  ) {
    revokeAccess(id: $id)
  }
`

const { Link } = routes

const getDays = (begin, end) => moment(end).diff(begin, 'days')

const GUTTER = 30

const styles = {
  heading: css({
    marginTop: 20,
    marginBottom: 20
  }),
  grant: css({
    width: `calc(50% - ${GUTTER}px)`,
    padding: 10,
    backgroundColor: colors.secondaryBg,
    marginBottom: GUTTER
  })
}

class Events extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isExpanded: false
    }

    this.toggle = (e) => {
      e.preventDefault()
      this.setState({
        isExpanded: !this.state.isExpanded
      })
    }
  }

  render() {
    const { events, t } = this.props
    const { isExpanded } = this.state

    return (
      <Fragment>
        <List>
          {isExpanded && events.map((event, i) => (
            <Item key={i}>{displayDateTime(event.createdAt)} {event.event}</Item>
          ))}
        </List>
        {isExpanded
          ? <A href='#' onClick={this.toggle}>
            {t('account/access/Events/details/hide')}
          </A>
          : <A href='#' onClick={this.toggle}>
            {t('account/access/Events/details/show')}
          </A>
        }
        <br />
      </Fragment>
    )
  }
}

class Grant extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isMutating: false,
      hasMutated: false,
      mutationError: null,
      isExpanded: false
    }

    this.hasMutated = () => {
      this.setState({
        isMutating: false,
        hasMutated: true
      })
    }

    this.catchMutationError = error => {
      this.setState({
        isMutating: false,
        mutationError: error
      })
    }

    this.onClick = (e) => {
      e.preventDefault()

      this.setState({
        isMutating: true,
        mutationError: null
      })

      return this.props.revokeAccess({
        variables: { id: this.props.grant.id }
      })
        .then(this.hasMutated)
        .catch(this.catchMutationError)
    }

    this.toggle = (e) => {
      e.preventDefault()
      this.setState({
        isExpanded: !this.state.isExpanded
      })
    }
  }

  render() {
    const { grant, t } = this.props
    const { isMutating, hasMutated, mutationError, isExpanded } = this.state

    return (
      <div {...styles.grant}>
        {mutationError &&
          <ErrorMessage error={mutationError} />
        }
        {grant.granter &&
          <Interaction.P>
            <Label>{t('account/access/Grant/granter/label')}</Label>
            <br />
            <Link
              route='user'
              params={{userId: grant.granter.id}}
              passHref>
              <A>
                {`${grant.granter.name} (${grant.granter.email})`}
              </A>
            </Link>
          </Interaction.P>
        }

        {grant.recipient &&
          <Interaction.P>
            <Label>{t('account/access/Grant/recipient/label')}</Label>
            <br />
            <Link
              route='user'
              params={{userId: grant.recipient.id}}
              passHref>
              <A>
                {`${grant.recipient.name} (${grant.recipient.email})`}
              </A>
            </Link>
          </Interaction.P>
        }

        {!grant.recipient && !!grant.email &&
          <Interaction.P>
            <Label>{t('account/access/Grant/recipient/unlinked/label')}</Label>
            <br />
            {grant.email}
          </Interaction.P>
        }

        <Interaction.P>
          <Label>{t('account/access/Grant/status/label')}</Label>
          <br />
          {grant.status}
        </Interaction.P>

        {(isExpanded || !grant.email) && grant.voucherCode &&
          <Interaction.P>
            <Label>{t('account/access/Grant/voucherCode/label')}</Label>
            <br />
            {grant.voucherCode}
          </Interaction.P>
        }

        {isExpanded &&
          <Interaction.P>
            <Label>{t('account/access/Grant/beginBefore/label')}</Label>
            <br />
            {displayDateTime(grant.beginBefore)}
          </Interaction.P>
        }

        {isExpanded && grant.beginAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/beginAt/label')}</Label>
            <br />
            {displayDateTime(grant.beginAt)}
          </Interaction.P>
        }

        {grant.endAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/endAt/label')}</Label>
            <br />
            {displayDateTime(grant.endAt)}<br />
          </Interaction.P>
        }

        {isExpanded && new Date(grant.endAt) > new Date() &&
          <Interaction.P>
            <Label>{t('account/access/Grant/remaining/label')}</Label>
            <br />
            {getDays(new Date(), grant.endAt)} Tage
          </Interaction.P>
        }

        {isExpanded &&
          <Interaction.P>
            <Label>{t('account/access/Grant/createdAt/label')}</Label>
            <br />
            {displayDateTime(grant.createdAt)}
          </Interaction.P>
        }

        {isExpanded && grant.revokedAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/revokedAt/label')}</Label>
            <br />
            {displayDateTime(grant.revokedAt)}
          </Interaction.P>
        }

        {isExpanded && grant.invalidatedAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/invalidatedAt/label')}</Label>
            <br />
            {displayDateTime(grant.invalidatedAt)}
          </Interaction.P>
        }

        {isExpanded && grant.campaign &&
          <Interaction.P>
            <Label>{t('account/access/Grant/campaign/label')}</Label>
            <br />
            {grant.campaign.title}
          </Interaction.P>
        }

        {isExpanded && grant.campaign && grant.campaign.endAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/campaignEndAt/label')}</Label>
            <br />
            {displayDateTime(grant.campaign.endAt)}
          </Interaction.P>
        }

        {isExpanded &&
          <Interaction.P>
            <Label>{t('account/access/Grant/id/label')}</Label>
            <br />
            {grant.id}
          </Interaction.P>
        }

        {isExpanded
          ? <A href='#' onClick={this.toggle}>
            {t('account/access/Grant/details/hide')}
          </A>
          : <A href='#' onClick={this.toggle}>
            {t('account/access/Grant/details/show')}
          </A>
        }

        <Events events={grant.events} t={t} />

        {!grant.revokedAt && !grant.invalidatedAt &&
          <Fragment>
            <HR />
            {isMutating || hasMutated
              ? <InlineSpinner />
              : <Button onClick={this.onClick}>
                {t('account/access/Grant/button/revoke')}
              </Button>
            }
          </Fragment>
        }
      </div>
    )
  }
}

const Slots = ({ slots, t }) => {
  return (
    <List>
      <Item>{t('account/access/Slots/free', { count: slots.free })}</Item>
      <Item>{t('account/access/Slots/used', { count: slots.used })}</Item>
      <Item>{t('account/access/Slots/total', { count: slots.total })}</Item>
    </List>
  )
}


const Grants = ({ grants, revokeAccess, t }) => (
  <Fragment>
    <SectionTitle>
      {t('account/access/Grants/title')}
    </SectionTitle>
    <div {...styles.grants}>
      {grants && grants.length > 0
        ? grants.map(grant => (
          <Grant
            key={`grants-${grant.id}`}
            grant={grant}
            revokeAccess={revokeAccess}
            t={t} />
        ))
        : <Interaction.P>
          {t('account/access/Grants/noGrants')}
        </Interaction.P>
      }
    </div>
  </Fragment>
)

const Campaigns = ({ campaigns, revokeAccess, t }) => (
  <Fragment>
    <SectionTitle>
      {t('account/access/Campaigns/title')}
    </SectionTitle>
    {campaigns && campaigns.length > 0 && campaigns.map(campaign => (
      <Fragment key={`camp-${campaign.id}`}>
        <Interaction.H3>
          {t(
            'account/access/Campaigns/campaign/title',
            { title: campaign.title }
          )}
        </Interaction.H3>
        <Label>
          {t(
            moment(campaign.endAt) < moment()
              ? 'account/access/Campaigns/campaign/ended'
              : 'account/access/Campaigns/campaign/ending',
            { endAt: displayDateTime(campaign.endAt) }
          )}
        </Label>
        {campaign.slots && <Slots slots={campaign.slots} t={t} />}
        <div {...styles.grants}>
          {campaign.grants.map(grant => (
            <Grant
              key={`camp-grants-${grant.id}`}
              grant={grant}
              revokeAccess={revokeAccess}
              t={t} />
          ))}
        </div>
      </Fragment>
    ))}
    {campaigns && campaigns.length === 0 &&
      <Interaction.P>
        {t('account/access/Campaigns/noCampaigns')}
      </Interaction.P>
    }
  </Fragment>
)

const Access = withT(({ grants, campaigns, revokeAccess, t }) => {
  return (
    <Section>
      <Grants grants={grants} revokeAccess={revokeAccess} t={t} />
      <Campaigns campaigns={campaigns} revokeAccess={revokeAccess} t={t} />
    </Section>
  )
})

const AccessComponent = ({ userId }) => {
  return (
    <Query query={GET_ACCESS_GRANTS} variables={{id: userId}}>{({loading, error, data}) => {
      return (
        <Mutation mutation={REVOKE_ACCESS}>{
          (revokeAccess, {loading: mutationLoading, error: mutationError}) => (
            <Loader
              loading={loading || mutationLoading}
              error={error || mutationError}
              render={() =>
                <Access grants={data.user.accessGrants} campaigns={data.user.accessCampaigns} revokeAccess={revokeAccess} />
              }
            />
          )
        }</Mutation>
      )
    }}</Query>
  )
};

export default AccessComponent;
