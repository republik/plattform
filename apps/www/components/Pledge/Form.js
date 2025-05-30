import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import PropTypes from 'prop-types'
import { Component, Fragment } from 'react'

import withMe from '../../lib/apollo/withMe'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import withT from '../../lib/withT'

import SignIn from '../Auth/SignIn'
import withMembership from '../Auth/withMembership'
import FieldSet from '../FieldSet'
import Meta from '../Frame/Meta'
import Loader from '../Loader'

import { A, Interaction, RawHtml } from '@project-r/styleguide'

import Link from 'next/link'
import Accordion from './Accordion'
import CustomizePackage, {
  getOptionFieldKey,
  getOptionPeriodsFieldKey,
} from './CustomizePackage'
import Submit from './Submit'

import ErrorMessage from '../ErrorMessage'

const { H1, P } = Interaction

class Pledge extends Component {
  constructor(props) {
    super(props)

    const values = {}
    let basePledge

    const { pledge, query } = props

    // ~ as url safe separator, backend code generating a membership ids link:
    // https://github.com/orbiting/backends/blob/0abb797db8d0feb7af579c7efc85242cdf110016/servers/republik/modules/crowdfundings/lib/Mail.js#L476
    const membershipIds = query.membershipIds && query.membershipIds.split('~')
    if (membershipIds) {
      const pkg = this.getPkg()
      if (pkg) {
        const matchingOptions = pkg.options.filter(
          (option) =>
            option.membership && membershipIds.includes(option.membership.id),
        )
        if (matchingOptions.length) {
          // we set all other options to the min amount (normally 0)
          // - this unselect extending ones own memberhip when arriving from a membership_giver_prolong_notice
          pkg.options
            .filter((option) => option.membership)
            .forEach((option) => {
              values[getOptionFieldKey(option)] = option.minAmount
            })
          // set matching options to max amount (normally 1)
          matchingOptions
            // only first one if grouped
            .filter(
              (option, i, all) =>
                !option.optionGroup ||
                all.findIndex((o) => o.optionGroup === option.optionGroup) ===
                  i,
            )
            .forEach((option) => {
              values[getOptionFieldKey(option)] = option.maxAmount
            })
        }
      }
    }

    if (query.membershipType) {
      const pkg = this.getPkg()
      if (pkg) {
        const matchingOptions = pkg.options.filter(
          (option) =>
            option.membership &&
            option.reward &&
            option.reward.name === query.membershipType &&
            option.membership.user?.id === props.customMe?.id, // only preselect own membership
        )
        if (matchingOptions.length) {
          // we set all other options to the min amount (normally 0)
          pkg.options
            .filter((option) => option.membership)
            .forEach((option) => {
              values[getOptionFieldKey(option)] = option.minAmount
            })
          // set matching options to max amount (normally 1)
          matchingOptions
            // only first one if grouped
            .filter(
              (option, i, all) =>
                !option.optionGroup ||
                all.findIndex((o) => o.optionGroup === option.optionGroup) ===
                  i,
            )
            .forEach((option) => {
              values[getOptionFieldKey(option)] = option.maxAmount
            })
        }
      }
    }

    if (pledge) {
      values.reason = pledge.reason
      values.price = pledge.total
      pledge.options.forEach((option) => {
        values[getOptionFieldKey(option)] = option.amount
        if (option.periods !== null) {
          values[getOptionPeriodsFieldKey(option)] = option.periods
        }
      })
      basePledge = {
        values: {
          ...values,
        },
        query: {
          ...query,
        },
        pledge,
      }
    } else {
      values.price = +query.price || undefined
      values.reason = query.reason ? `${query.reason}` : undefined
    }

    this.state = {
      basePledge,
      values,
      errors: {},
      dirty: {
        price: values.price ? true : undefined,
      },
    }
  }
  getPkg(base) {
    const { query } = base || this.props
    const { packages } = this.props
    let pkg = query.package
      ? packages.find((pkg) => pkg.name === query.package.toUpperCase())
      : null
    if (pkg) {
      if (query.userPrice) {
        // only offer userPrice true options
        pkg = {
          ...pkg,
          options: pkg.options.filter((option) => option.userPrice),
        }
      }
      // the frontend no longer supports accessGranted and strips those options
      const hasAccessGranted = pkg.options.some(
        (option) => option.accessGranted,
      )
      if (hasAccessGranted) {
        pkg = {
          ...pkg,
          options: pkg.options.filter((option) => !option.accessGranted),
        }
      }
    }

    return pkg
  }
  submitPledgeProps({ values, query, pledge }) {
    const pkg = this.getPkg({ query })
    const userPrice = !!query.userPrice

    let requireShippingAddress = pkg
      ? ['ABO', 'BENEFACTOR'].includes(pkg.name)
      : false
    const options = pkg
      ? pkg.options.map((option) => {
          const fieldKey = getOptionFieldKey(option)
          const fieldKeyPeriods = getOptionPeriodsFieldKey(option)

          const amount =
            values[fieldKey] === undefined
              ? option.defaultAmount
              : // can be '', but PackageOptionInput needs Int! here
                +values[fieldKey]
          if (amount) {
            if (option.reward?.__typename === 'Goodie') {
              requireShippingAddress = true
            }
          }

          return {
            amount,
            periods:
              values[fieldKeyPeriods] !== undefined
                ? // can be '', but PackageOptionInput needs Int here
                  +values[fieldKeyPeriods]
                : option.reward && option.reward.defaultPeriods,
            price: option.price,
            templateId: option.templateId,
            membershipId: option.membership ? option.membership.id : undefined,
            autoPay: [true, false].includes(option.autoPay)
              ? option.autoPay
              : undefined,
          }
        })
      : []

    return {
      accessToken: query.token,
      packageGroup: pkg ? pkg.group : undefined,
      packageName: pkg ? pkg.name : undefined,
      forceAutoPay: pkg ? pkg.name === 'MONTHLY_ABO' : undefined,
      requiresStatutes: pkg
        ? !['YEARLY_ABO', 'MONTHLY_ABO', 'DONATE', 'LESHA'].includes(pkg.name)
        : undefined,
      paymentMethods: pkg ? pkg.paymentMethods : undefined,
      // EINSTIEGSMONAT-TEST (remove after test) change total back
      total:
        pkg.name === 'MONTHLY_ABO' && query.coupon === 'EINSTIEG24'
          ? values.price + 1100
          : values.price || undefined,
      options,
      reason: userPrice ? values.reason : undefined,
      coupon: query.coupon,
      id: pledge ? pledge.id : undefined,
      pledgeShippingAddress: pledge ? pledge.shippingAddress : undefined,
      pledgeUser: pledge ? pledge.user : undefined,
      requireShippingAddress,
    }
  }
  refetchPackages() {
    const prevPkg = this.getPkg()
    this.props.refetchPackages().then(() => {
      if (this.getPkg() !== prevPkg) {
        window.scrollTo(0, 0)
      }
    })
  }
  prefillValues({ query }) {
    const { values } = this.state
    if (!values.price && query.price) {
      this.setState(
        FieldSet.utils.mergeField({
          field: 'price',
          value: +query.price || undefined,
        }),
      )
    }
    if (!values.reason && query.reason) {
      this.setState(
        FieldSet.utils.mergeField({
          field: 'reason',
          value: `${query.reason}`,
        }),
      )
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.me !== this.props.me ||
      nextProps.query.token !== this.props.query.token
    ) {
      this.refetchPackages()
    }
    if (nextProps.query !== this.props.query) {
      this.prefillValues(nextProps)
    }
  }
  componentDidMount() {
    this.prefillValues(this.props)
  }
  render() {
    const { values, errors, dirty, basePledge } = this.state

    const {
      preventMetaUpdate, // flag to prevent <Meta /> being rendered
      loading,
      error,
      isMember,
      t,
      customMe,
      query,
      packages,
    } = this.props

    const queryGroup = query.group
    const queryPackage = query.package && query.package.toUpperCase()
    const pkg = this.getPkg()

    const packageInstruction = t.elements(
      `pledge/form/instruction/${queryPackage}/${
        customMe ? (pkg ? 'available' : 'notAvailable') : 'signIn'
      }`,
      {
        accountLink: (
          <Link key='account' href='/konto' passHref legacyBehavior>
            <A>{t(`pledge/form/instruction/${queryPackage}/accountText`)}</A>
          </Link>
        ),
      },
      '',
    )

    const meta = !preventMetaUpdate && {
      title: t.first([
        pkg && `pledge/meta/package/${pkg.name}/title`,
        queryGroup && `pledge/meta/group/${queryGroup}/title`,
        'pledge/meta/title',
      ]),
      description: t.first([
        pkg && `pledge/meta/package/${pkg.name}/description`,
        queryGroup && `pledge/meta/group/${queryGroup}/description`,
        'pledge/meta/description',
      ]),
      image:
        pkg?.name === 'LESHA'
          ? `${CDN_FRONTEND_BASE_URL}/static/social-media/we_stay.jpg`
          : `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    }

    return (
      <Fragment>
        {!!meta && <Meta data={meta} />}
        <Loader
          loading={loading}
          error={error}
          render={() => {
            const { receiveError, hasEnded } = this.props

            if (hasEnded && !this.props.pledge) {
              return (
                <div>
                  <H1>{t('pledge/title')}</H1>
                  <RawHtml
                    type={P}
                    dangerouslySetInnerHTML={{
                      __html: t('ended/pledge/lead'),
                    }}
                  />
                </div>
              )
            }

            const userPrice = !!query.userPrice

            const ownMembershipOption =
              customMe &&
              pkg &&
              pkg.options.find(
                (option) =>
                  option.membership &&
                  option.membership.user &&
                  option.membership.user.id === customMe.id,
              )
            const ownMembership =
              ownMembershipOption && ownMembershipOption.membership
            const title = t.first(
              [
                ownMembership &&
                  `pledge/title/${pkg.name}/${ownMembership.type.name}`,
                ownMembership &&
                  new Date(ownMembership.graceEndDate) < new Date() &&
                  `pledge/title/${pkg.name}/reactivate`,
                pkg && isMember && `pledge/title/${pkg.name}/member`,
                pkg && `pledge/title/${pkg.name}`,
                !pkg && isMember && 'pledge/title/member',
                !pkg && 'pledge/title',
              ].filter(Boolean),
              undefined,
              '',
            )

            return (
              <div>
                {packageInstruction && !!packageInstruction.length && (
                  <div style={{ marginBottom: 40 }}>
                    <P>{packageInstruction}</P>
                    {!customMe && (
                      <div style={{ marginTop: 20 }}>
                        <SignIn context='pledge' />
                      </div>
                    )}
                  </div>
                )}
                <H1>{title}</H1>

                {!!receiveError && (
                  <ErrorMessage style={{ margin: '0 0 40px' }}>
                    {receiveError}
                  </ErrorMessage>
                )}

                <div style={{ marginBottom: 40 }}>
                  {pkg ? (
                    <CustomizePackage
                      key={pkg.id}
                      values={values}
                      errors={errors}
                      dirty={dirty}
                      ownMembership={ownMembership}
                      customMe={customMe}
                      userPrice={userPrice}
                      fixedPrice={pkg.options.every((opt) => opt.fixedPrice)}
                      pkg={pkg}
                      packages={packages}
                      onChange={(fields) => {
                        this.setState(FieldSet.utils.mergeFields(fields))
                      }}
                    />
                  ) : (
                    <Accordion
                      packages={packages.filter(
                        ({ group }) => group !== 'HIDDEN',
                      )}
                      group={queryGroup}
                      extended
                    />
                  )}
                </div>
                {pkg && (
                  <Submit
                    query={query}
                    customMe={customMe}
                    {...this.submitPledgeProps({ values, query })}
                    basePledge={
                      basePledge
                        ? this.submitPledgeProps(basePledge)
                        : undefined
                    }
                    errors={errors}
                    onError={() => {
                      this.setState((state) => {
                        const dirty = {
                          ...state.dirty,
                        }
                        Object.keys(state.errors).forEach((field) => {
                          if (state.errors[field]) {
                            dirty[field] = true
                          }
                        })
                        return {
                          dirty,
                        }
                      })
                    }}
                  />
                )}
              </div>
            )
          }}
        />
      </Fragment>
    )
  }
}

Pledge.propTypes = {
  query: PropTypes.object.isRequired,
}

const query = gql`
  query pledgeForm($accessToken: ID) {
    crowdfunding(name: "LAUNCH") {
      id
      name
      hasEnded
      packages {
        id
        name
        group
        paymentMethods
        options {
          id
          price
          userPrice
          autoPay
          fixedPrice
          payMoreSuggestion
          minAmount
          maxAmount
          defaultAmount
          templateId
          accessGranted
          reward {
            __typename
            ... on MembershipType {
              id
              name
              interval
              minPeriods
              maxPeriods
              defaultPeriods
            }
            ... on Goodie {
              id
              name
            }
          }
        }
      }
    }
    me(accessToken: $accessToken) {
      id
      firstName
      lastName
      email
      isUserOfCurrentSession
      isListed
      address {
        name
        line1
        line2
        postalCode
        city
        country
      }
      customPackages {
        id
        name
        group
        paymentMethods
        suggestedTotal
        options {
          id
          price
          userPrice
          autoPay
          fixedPrice
          payMoreSuggestion
          minAmount
          maxAmount
          defaultAmount
          templateId
          optionGroup
          accessGranted
          reward {
            __typename
            ... on MembershipType {
              id
              name
              interval
              minPeriods
              maxPeriods
              defaultPeriods
            }
            ... on Goodie {
              id
              name
            }
          }
          membership {
            id
            user {
              id
            }
            claimerName
            createdAt
            sequenceNumber
            renew
            active
            overdue
            autoPay
            graceEndDate
            type {
              name
            }
            periods {
              kind
              beginDate
              endDate
            }
          }
          additionalPeriods {
            kind
            beginDate
            endDate
          }
        }
      }
    }
  }
`

const PledgeWithQueries = compose(
  graphql(query, {
    options: ({ query }) => ({
      variables: {
        accessToken: query.token,
      },
    }),
    props: ({ data }) => {
      const packages = []
        .concat(data.me && data.me.customPackages)
        .concat(data.crowdfunding && data.crowdfunding.packages)
        .filter(Boolean)
      return {
        refetchPackages: data.refetch,
        loading: data.loading,
        error: data.error,
        packages,
        hasEnded: data.crowdfunding && data.crowdfunding.hasEnded,
        customMe: data.me,
      }
    },
  }),
  withMembership, // provides isMember
  withT,
  withMe,
  withRouter,
)(Pledge)

export default PledgeWithQueries
