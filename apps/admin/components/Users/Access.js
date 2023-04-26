import { Component, Fragment } from 'react'
import { Query, Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
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
  Loader,
  Overlay,
  OverlayToolbar,
  OverlayBody,
  fontStyles,
} from '@project-r/styleguide'

import ErrorMessage from '../ErrorMessage'
import List, { Item } from '../List'
import Link from 'next/link'
import { displayDateTime, Section, SectionTitle } from '../Display/utils'

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
        followupAt
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
          followupAt
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
  mutation revokeAccess($id: ID!) {
    revokeAccess(id: $id)
  }
`

const INVALIDATE_ACCESS = gql`
  mutation invalidateAccess($id: ID!) {
    invalidateAccess(id: $id)
  }
`

const getDays = (begin, end) => moment(end).diff(begin, 'days')

const GUTTER = 30

const styles = {
  container: css({
    marginTop: 20,
    '&:first-child': {
      marginTop: '0',
    },
  }),
  heading: css({
    marginTop: 20,
    marginBottom: 20,
  }),
  grant: css({
    width: `calc(50% - ${GUTTER}px)`,
    padding: 10,
    backgroundColor: colors.secondaryBg,
    marginBottom: GUTTER,
  }),
  button: css({
    marginRight: 10,
    display: 'inline-block',
  }),
  confirmButton: css({
    marginTop: 20,
  }),
  info: css({
    color: '#757575',
    ...fontStyles.sansSerifRegular14,
  }),
}

class Events extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isExpanded: false,
    }

    this.toggle = (e) => {
      e.preventDefault()
      this.setState({
        isExpanded: !this.state.isExpanded,
      })
    }
  }

  render() {
    const { events, t } = this.props
    const { isExpanded } = this.state

    return (
      <Fragment>
        <List>
          {isExpanded &&
            events.map((event, i) => (
              <Item key={i}>
                {displayDateTime(event.createdAt)} {event.event}
              </Item>
            ))}
        </List>
        {isExpanded ? (
          <A href='#' onClick={this.toggle}>
            {t('account/access/Events/details/hide')}
          </A>
        ) : (
          <A href='#' onClick={this.toggle}>
            {t('account/access/Events/details/show')}
          </A>
        )}
        <br />
      </Fragment>
    )
  }
}

class Grant extends Component {
  constructor(props) {
    super(props)
    const { grant } = props
    this.state = {
      isExpanded: false,
      isOpenRevoke: false,
      isOpenInvalidate: false,
    }

    this.toggle = (e) => {
      e.preventDefault()
      this.setState({
        isExpanded: !this.state.isExpanded,
      })
    }

    this.openHandlerRevoke = () => {
      this.setState(() => ({ isOpenRevoke: true }))
    }

    this.openHandlerInvalidate = () => {
      this.setState(() => ({ isOpenInvalidate: true }))
    }

    this.closeHandlerRevoke = () => {
      this.setState(() => ({ isOpenRevoke: false }))
    }

    this.closeHandlerInvalidate = () => {
      this.setState(() => ({ isOpenInvalidate: false }))
    }

    this.revokeHandler = (mutation) => () => {
      return mutation({
        variables: { id: grant.id },
      }).then(() =>
        this.setState(() => ({
          isOpenRevoke: false,
        })),
      )
    }

    this.invalidateHandler = (mutation) => () => {
      return mutation({
        variables: { id: grant.id },
      }).then(() =>
        this.setState(() => ({
          isOpenInvalidate: false,
        })),
      )
    }
  }

  render() {
    const { userId, grant, t } = this.props
    const { isExpanded, isOpenRevoke, isOpenInvalidate } = this.state

    return (
      <div {...styles.grant}>
        {grant.granter && (
          <Interaction.P>
            <Label>{t('account/access/Grant/granter/label')}</Label>
            <br />
            <Link href={`/users/${grant.granter.id}`} passHref legacyBehavior>
              <A>{`${grant.granter.name} (${grant.granter.email})`}</A>
            </Link>
          </Interaction.P>
        )}

        {grant.recipient && (
          <Interaction.P>
            <Label>{t('account/access/Grant/recipient/label')}</Label>
            <br />
            <Link href={`/users/${grant.recipient.id}`} passHref legacyBehavior>
              <A>{`${grant.recipient.name} (${grant.recipient.email})`}</A>
            </Link>
          </Interaction.P>
        )}

        {!grant.recipient && !!grant.email && (
          <Interaction.P>
            <Label>{t('account/access/Grant/recipient/unlinked/label')}</Label>
            <br />
            {grant.email}
          </Interaction.P>
        )}

        <Interaction.P>
          <Label>{t('account/access/Grant/status/label')}</Label>
          <br />
          {grant.status}
        </Interaction.P>

        {(isExpanded || !grant.email) && grant.voucherCode && (
          <Interaction.P>
            <Label>{t('account/access/Grant/voucherCode/label')}</Label>
            <br />
            {grant.voucherCode}
          </Interaction.P>
        )}

        {isExpanded && (
          <Interaction.P>
            <Label>{t('account/access/Grant/beginBefore/label')}</Label>
            <br />
            {displayDateTime(grant.beginBefore)}
          </Interaction.P>
        )}

        {isExpanded && grant.beginAt && (
          <Interaction.P>
            <Label>{t('account/access/Grant/beginAt/label')}</Label>
            <br />
            {displayDateTime(grant.beginAt)}
          </Interaction.P>
        )}

        {grant.endAt && (
          <Interaction.P>
            <Label>{t('account/access/Grant/endAt/label')}</Label>
            <br />
            {displayDateTime(grant.endAt)}
            <br />
          </Interaction.P>
        )}

        {isExpanded && new Date(grant.endAt) > new Date() && (
          <Interaction.P>
            <Label>{t('account/access/Grant/remaining/label')}</Label>
            <br />
            {getDays(new Date(), grant.endAt)} Tage
          </Interaction.P>
        )}

        {isExpanded && (
          <Interaction.P>
            <Label>{t('account/access/Grant/createdAt/label')}</Label>
            <br />
            {displayDateTime(grant.createdAt)}
          </Interaction.P>
        )}

        {isExpanded && grant.revokedAt && (
          <Interaction.P>
            <Label>{t('account/access/Grant/revokedAt/label')}</Label>
            <br />
            {displayDateTime(grant.revokedAt)}
          </Interaction.P>
        )}

        {isExpanded && grant.invalidatedAt && (
          <Interaction.P>
            <Label>{t('account/access/Grant/invalidatedAt/label')}</Label>
            <br />
            {displayDateTime(grant.invalidatedAt)}
          </Interaction.P>
        )}

        {isExpanded && grant.campaign && (
          <Interaction.P>
            <Label>{t('account/access/Grant/campaign/label')}</Label>
            <br />
            {grant.campaign.title}
          </Interaction.P>
        )}

        {isExpanded && grant.campaign && grant.campaign.endAt && (
          <Interaction.P>
            <Label>{t('account/access/Grant/campaignEndAt/label')}</Label>
            <br />
            {displayDateTime(grant.campaign.endAt)}
          </Interaction.P>
        )}

        {isExpanded && (
          <Interaction.P>
            <Label>{t('account/access/Grant/id/label')}</Label>
            <br />
            {grant.id}
          </Interaction.P>
        )}

        {isExpanded ? (
          <A href='#' onClick={this.toggle}>
            {t('account/access/Grant/details/hide')}
          </A>
        ) : (
          <A href='#' onClick={this.toggle}>
            {t('account/access/Grant/details/show')}
          </A>
        )}

        <Events events={grant.events} t={t} />

        <Fragment>
          <HR />
          {!grant.revokedAt && !grant.beginAt && !grant.invalidatedAt && (
            <>
              <div {...styles.button}>
                <Button primary onClick={this.openHandlerRevoke}>
                  {t('account/access/Grant/button/revoke')}
                </Button>
              </div>
              {isOpenRevoke && (
                <Mutation
                  mutation={REVOKE_ACCESS}
                  refetchQueries={() => [
                    {
                      query: GET_ACCESS_GRANTS,
                      variables: { id: userId },
                    },
                  ]}
                >
                  {(revokeAccess, { loading, error }) => {
                    return (
                      <Overlay onClose={this.closeHandlerRevoke}>
                        <OverlayToolbar onClose={this.closeHandlerRevoke} />
                        <OverlayBody>
                          <Loader
                            loading={loading}
                            error={error}
                            render={() => (
                              <Fragment>
                                <div>
                                  {t(
                                    'account/access/Grant/button/revoke/confirm/description',
                                  )}
                                </div>
                                {error && <ErrorMessage error={error} />}
                                {loading && <InlineSpinner />}
                                {!loading && (
                                  <div
                                    {...styles.button}
                                    {...styles.confirmButton}
                                  >
                                    <Button
                                      primary
                                      onClick={this.revokeHandler(revokeAccess)}
                                    >
                                      {t('account/access/Grant/button/confirm')}
                                    </Button>
                                  </div>
                                )}
                              </Fragment>
                            )}
                          />
                        </OverlayBody>
                      </Overlay>
                    )
                  }}
                </Mutation>
              )}
            </>
          )}
          {(!grant.invalidatedAt || !grant.followupAt) && (
            <>
              <div {...styles.button}>
                <Button primary onClick={this.openHandlerInvalidate}>
                  {!grant.invalidatedAt
                    ? t('account/access/Grant/button/invalidate')
                    : t('account/access/Grant/button/noFollowup')}
                </Button>
              </div>
              {isOpenInvalidate && (
                <Mutation
                  mutation={INVALIDATE_ACCESS}
                  refetchQueries={() => [
                    {
                      query: GET_ACCESS_GRANTS,
                      variables: { id: userId },
                    },
                  ]}
                >
                  {(invalidateAccess, { loading, error }) => {
                    return (
                      <Overlay onClose={this.closeHandlerInvalidate}>
                        <OverlayToolbar onClose={this.closeHandlerInvalidate} />
                        <OverlayBody>
                          <Loader
                            loading={loading}
                            error={error}
                            render={() => (
                              <Fragment>
                                <div>
                                  {!grant.invalidatedAt
                                    ? t(
                                        'account/access/Grant/button/invalidate/confirm/description',
                                      )
                                    : t(
                                        'account/access/Grant/button/noFollowup/confirm/description',
                                      )}
                                  <p {...styles.info}>
                                    {!grant.invalidatedAt &&
                                      t(
                                        'account/access/Grant/button/invalidate/confirm/description/detail',
                                      )}
                                  </p>
                                </div>
                                {error && <ErrorMessage error={error} />}
                                {loading && <InlineSpinner />}
                                {!loading && (
                                  <div
                                    {...styles.button}
                                    {...styles.confirmButton}
                                  >
                                    <Button
                                      primary
                                      onClick={this.invalidateHandler(
                                        invalidateAccess,
                                      )}
                                    >
                                      {t('account/access/Grant/button/confirm')}
                                    </Button>
                                  </div>
                                )}
                              </Fragment>
                            )}
                          />
                        </OverlayBody>
                      </Overlay>
                    )
                  }}
                </Mutation>
              )}
            </>
          )}
        </Fragment>
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

const Grants = ({ grants, userId, t }) => (
  <div {...styles.container}>
    <SectionTitle>{t('account/access/Grants/title')}</SectionTitle>
    <div {...styles.grants}>
      {grants && grants.length > 0 ? (
        grants.map((grant) => (
          <Grant
            key={`grants-${grant.id}`}
            grant={grant}
            userId={userId}
            t={t}
          />
        ))
      ) : (
        <Interaction.P>{t('account/access/Grants/noGrants')}</Interaction.P>
      )}
    </div>
  </div>
)

const Campaigns = ({ campaigns, userId, t }) => (
  <div {...styles.container}>
    <SectionTitle>{t('account/access/Campaigns/title')}</SectionTitle>
    {campaigns &&
      campaigns.length > 0 &&
      campaigns.map((campaign) => (
        <Fragment key={`camp-${campaign.id}`}>
          <Interaction.H3>
            {t('account/access/Campaigns/campaign/title', {
              title: campaign.title,
            })}
          </Interaction.H3>
          <Label>
            {t(
              moment(campaign.endAt) < moment()
                ? 'account/access/Campaigns/campaign/ended'
                : 'account/access/Campaigns/campaign/ending',
              { endAt: displayDateTime(campaign.endAt) },
            )}
          </Label>
          {campaign.slots && <Slots slots={campaign.slots} t={t} />}
          <div {...styles.grants}>
            {campaign.grants.map((grant) => (
              <Grant
                key={`camp-grants-${grant.id}`}
                grant={grant}
                userId={userId}
                t={t}
              />
            ))}
          </div>
        </Fragment>
      ))}
    {campaigns && campaigns.length === 0 && (
      <Interaction.P>{t('account/access/Campaigns/noCampaigns')}</Interaction.P>
    )}
  </div>
)

const Access = withT(({ grants, campaigns, userId, t }) => {
  return (
    <Section>
      <Grants grants={grants} userId={userId} t={t} />
      <Campaigns campaigns={campaigns} userId={userId} t={t} />
    </Section>
  )
})

const AccessComponent = ({ userId }) => {
  return (
    <Query query={GET_ACCESS_GRANTS} variables={{ id: userId }}>
      {({ loading, error, data }) => {
        return (
          <Loader
            loading={loading}
            error={error}
            render={() => (
              <Access
                grants={data.user.accessGrants}
                campaigns={data.user.accessCampaigns}
                userId={userId}
              />
            )}
          />
        )
      }}
    </Query>
  )
}

export default AccessComponent
