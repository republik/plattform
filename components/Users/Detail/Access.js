import { Component, Fragment } from 'react'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import moment from 'moment'

import withT from '../../../lib/withT'

import {
  colors,
  Button,
  Interaction,
  InlineSpinner,
  Label,
  HR,
  A
} from '@project-r/styleguide'

import ErrorMessage from '../../ErrorMessage'
import List, { Item } from '../../List'
import routes from '../../../server/routes'

const { Link } = routes

const getHumanDate = rawDate => moment(rawDate).format('DD.MM.YYYY HH:mm')
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
            <Item key={i}>{getHumanDate(event.createdAt)} {event.event}</Item>
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
        id: this.props.grant.id
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
              params={{userId: grant.granter.id}}>
              <a>
                {`${grant.granter.name} (${grant.granter.email})`}
              </a>
            </Link>
          </Interaction.P>
        }

        {grant.recipient &&
          <Interaction.P>
            <Label>{t('account/access/Grant/recipient/label')}</Label>
            <br />
            <Link
              route='user'
              params={{userId: grant.recipient.id}}>
              <a>
                {`${grant.recipient.name} (${grant.recipient.email})`}
              </a>
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

        {isExpanded && grant.voucherCode &&
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
            {getHumanDate(grant.beginBefore)}
          </Interaction.P>
        }

        {isExpanded && grant.beginAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/beginAt/label')}</Label>
            <br />
            {getHumanDate(grant.beginAt)}
          </Interaction.P>
        }

        {grant.endAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/endAt/label')}</Label>
            <br />
            {getHumanDate(grant.endAt)}<br />
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
            {getHumanDate(grant.createdAt)}
          </Interaction.P>
        }

        {isExpanded && grant.revokedAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/revokedAt/label')}</Label>
            <br />
            {getHumanDate(grant.revokedAt)}
          </Interaction.P>
        }

        {isExpanded && grant.invalidatedAt &&
          <Interaction.P>
            <Label>{t('account/access/Grant/invalidatedAt/label')}</Label>
            <br />
            {getHumanDate(grant.invalidatedAt)}
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
            {getHumanDate(grant.campaign.endAt)}
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
    <Interaction.H2 {...styles.heading}>
      {t('account/access/Grants/title')}
    </Interaction.H2>
    <div {...styles.grants}>
      {grants.length > 0
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
    <Interaction.H2 {...styles.heading}>
      {t('account/access/Campaigns/title')}
    </Interaction.H2>
    {campaigns.length > 0 && campaigns.map(campaign => (
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
            { endAt: getHumanDate(campaign.endAt) }
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
    {campaigns.length === 0 &&
      <Interaction.P>
        {t('account/access/Campaigns/noCampaigns')}
      </Interaction.P>
    }
  </Fragment>
)

const Access = ({ grants, campaigns, revokeAccess, t }) => {
  return (
    <Fragment>
      <Grants grants={grants} revokeAccess={revokeAccess} t={t} />
      <Campaigns campaigns={campaigns} revokeAccess={revokeAccess} t={t} />
    </Fragment>
  )
}

export default compose(withT)(Access)
