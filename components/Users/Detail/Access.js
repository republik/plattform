import { Component, Fragment } from 'react'

// import React, { Component } from 'react'
import { css } from 'glamor'
import moment from 'moment'

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
    const { events } = this.props
    const { isExpanded } = this.state

    return (
      <List>
        {isExpanded && events.map((event, i) => (
          <Item key={i}>{getHumanDate(event.createdAt)} {event.event}</Item>
        ))}
        {isExpanded
          ? <A href='#' onClick={this.toggle}>Events ausblenden</A>
          : <A href='#' onClick={this.toggle}>Events anzeigen</A>
        }
      </List>
    )
  }
}

class Grant extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isMutating: false,
      hasMutated: false,
      mutationError: null
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
  }

  render() {
    const { grant, revokeAccess } = this.props
    const { isMutating, hasMutated, mutationError } = this.state

    if (!mutationError && (isMutating || hasMutated)) {
      return (
        <div {...styles.grant}>
          <Interaction.P>
            Einen Augenblick. Daten werden aktualisiert...
          </Interaction.P>
          <InlineSpinner size={36} />
        </div>
      )
    }

    return (
      <div {...styles.grant}>
        {mutationError &&
          <ErrorMessage error={mutationError} />
        }
        {grant.grantee &&
          <Interaction.P>
            <Label>Spender</Label>
            <br />
            <Link
              route='user'
              params={{userId: grant.grantee.id}}>
              {`${grant.grantee.name} (${grant.grantee.email})`}
            </Link>
          </Interaction.P>
        }

        {grant.recipient &&
          <Interaction.P>
            <Label>Empfänger</Label>
            <br />
            <Link
              route='user'
              params={{userId: grant.recipient.id}}>
              {`${grant.recipient.name} (${grant.recipient.email})`}
            </Link>
          </Interaction.P>
        }

        {!grant.recipient && !!grant.email &&
          <Interaction.P>
            <Label>Empfänger (nicht verknüpft)</Label>
            <br />
            {grant.email}
          </Interaction.P>
        }

        <Interaction.P>
          <Label>Beginn</Label>
          <br />
          {getHumanDate(grant.beginAt)}
        </Interaction.P>

        <Interaction.P>
          <Label>Ende</Label>
          <br />
          {getHumanDate(grant.endAt)}<br />
          ({getDays(grant.beginAt, grant.endAt)} Tage)
        </Interaction.P>

        {new Date(grant.endAt) > new Date() &&
          <Interaction.P>
            <Label>verbleibend</Label>
            <br />
            {getDays(new Date(), grant.endAt)} Tage
          </Interaction.P>
        }

        {grant.campaign &&
          <Interaction.P>
            <Label>Kampagne</Label>
            <br />
            {grant.campaign.title}
          </Interaction.P>
        }

        <Interaction.P>
          <Label>erstellt am</Label>
          <br />
          {getHumanDate(grant.createdAt)}
        </Interaction.P>

        <Events events={grant.events} />
        <Label>Grant ID: {grant.id}</Label>

        {revokeAccess && grant.isValid &&
          <Fragment>
            <HR />
            <Button onClick={this.onClick}>Entziehen</Button>
          </Fragment>
        }
      </div>
    )
  }
}

const Slots = ({ slots }) => {
  return (
    <Interaction.P>
      Total: {slots.total}, Vergeben: {slots.used}, Frei: {slots.free}
    </Interaction.P>
  )
}


const Grants = ({ grants, revokeAccess }) => (
  <Fragment>
    <Interaction.H2 {...styles.heading}>
      Erhaltene Zugriffe
    </Interaction.H2>
    <div {...styles.grants}>
      {grants.length > 0
        ? grants.map(grant => (
          <Grant
            key={`grants-${grant.id}`}
            grant={grant}
            revokeAccess={revokeAccess} />
        ))
        : <Interaction.P>keine Zugriffe erhalten</Interaction.P>
      }
    </div>
  </Fragment>
)

const Campaigns = ({ campaigns, revokeAccess }) => (
  <Fragment>
    <Interaction.H2 {...styles.heading}>
      Vergebene Zugriffe
    </Interaction.H2>
    {campaigns.length > 0 && campaigns.map(campaign => (
      <Fragment key={`camp-${campaign.id}`}>
        <Interaction.H3>Kampagne «{campaign.title}»</Interaction.H3>
        {campaign.slots && <Slots slots={campaign.slots} />}
        <div {...styles.grants}>
          {campaign.grants.map(grant => (
            <Grant
              key={`camp-grants-${grant.id}`}
              grant={grant}
              revokeAccess={revokeAccess} />
          ))}
        </div>
      </Fragment>
    ))}
    {campaigns.length === 0 &&
      <Interaction.P>keine Kampagnen verfügbar</Interaction.P>
    }
  </Fragment>
)

const Access = ({ grants, campaigns, revokeAccess }) => {
  return (
    <Fragment>
      <Grants grants={grants} revokeAccess={revokeAccess} />
      <Campaigns campaigns={campaigns} revokeAccess={revokeAccess} />
    </Fragment>
  )
}

export default Access
