import { Component } from 'react'
import compose from 'lodash/flowRight'
import { format } from 'url'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'

import Poller from '../Auth/Poller'
import { withSignIn } from '../Auth/SignIn'
import { WithAccess } from '../Auth/withMembership'
import ErrorMessage from '../ErrorMessage'

import ClaimPledge from './Claim'

import { EMAIL_CONTACT, ONBOARDING_PACKAGES } from '../../lib/constants'

import {
  A,
  Interaction,
  InlineSpinner,
  Button,
  Loader,
  Meta,
} from '@project-r/styleguide'

import RawHtmlTranslation from '../RawHtmlTranslation'
import { withRouter } from 'next/router'
import Link from 'next/link'

const { P, H1 } = Interaction

export const gotoMerci = (query) => {
  // workaround for apollo cache issues
  // - can't manage to clear all query caches
  // - couldn't clear myAddress query,
  //   possibly because id-less address type
  // - good reset if sign in / out status changed during purchasing / claiming
  window.location = format({
    pathname: '/konto',
    query,
  })
}

export const encodeSignInResponseQuery = ({
  phrase,
  tokenType,
  alternativeFirstFactors,
}) => {
  const query = {
    phrase,
    tokenType,
  }
  if (alternativeFirstFactors && alternativeFirstFactors.length) {
    query.aff = alternativeFirstFactors.join(',')
  }
  return query
}

const parseSignInResponseQuery = (query) => {
  if (query.signInError) {
    return {
      signInError: query.signInError,
    }
  }
  return {
    signInResponse: {
      phrase: query.phrase,
      tokenType: query.tokenType || 'EMAIL_TOKEN',
      alternativeFirstFactors: query.aff ? query.aff.split(',') : [],
    },
  }
}

class Merci extends Component {
  constructor(props) {
    super(props)
    const { query } = this.props

    this.state = {
      polling: !!(query.email && query.phrase),
      email: query.email,
      ...parseSignInResponseQuery(query),
    }
  }

  componentDidMount() {
    this.maybeRelocateToOnboarding()
  }

  componentDidUpdate() {
    this.maybeRelocateToOnboarding()
  }

  maybeRelocateToOnboarding() {
    const { me, query, router } = this.props

    if (me && ONBOARDING_PACKAGES.includes(query.package) && !query.claim) {
      router.replace(
        {
          pathname: '/einrichten',
          query: { context: 'pledge', package: query.package },
        },
        undefined,
        { shallow: router.pathname === '/einrichten' },
      )
    }
  }

  render() {
    const { me, t, query, children } = this.props
    const { polling, email, signInResponse, signInError, signInLoading } =
      this.state

    if (query.claim) {
      return <ClaimPledge t={t} me={me} id={query.claim} pkg={query.package} />
    }
    if (polling) {
      return (
        <>
          <P style={{ marginBottom: 15 }}>{t('merci/postpay/lead')}</P>
          <Poller
            tokenType={signInResponse.tokenType}
            email={email}
            phrase={signInResponse.phrase}
            alternativeFirstFactors={signInResponse.alternativeFirstFactors}
            onSuccess={() => {
              this.setState({
                polling: false,
              })
            }}
          />
          <P>
            {!!query.id && (
              <Link
                href={{
                  pathname: '/konto',
                  query: { claim: query.id, package: query.package },
                }}
                passHref
              >
                <A>
                  <br />
                  <br />
                  {t('merci/postpay/reclaim')}
                </A>
              </Link>
            )}
          </P>
        </>
      )
    }

    if (signInError && email && query.id) {
      return (
        <>
          <H1>{t('merci/postpay/signInError/title')}</H1>
          <P>
            <RawHtmlTranslation
              translationKey='merci/postpay/signInError/text'
              replacements={{
                email: query.email,
                contactEmailLink: (
                  <A
                    key='contact'
                    href={`mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent(
                      t('merci/postpay/signInError/email/subject'),
                    )}&body=${encodeURIComponent(
                      t('merci/postpay/signInError/email/body', {
                        pledgeId: query.id,
                        email: email,
                        error: signInError,
                      }),
                    )}`}
                  >
                    {EMAIL_CONTACT}
                  </A>
                ),
              }}
            />
          </P>
          {!!signInError && <ErrorMessage error={signInError} />}
          <div style={{ margin: '20px 0' }}>
            {signInLoading ? (
              <InlineSpinner />
            ) : (
              <Button
                block
                disabled={signInLoading}
                onClick={() => {
                  if (signInLoading) {
                    return
                  }
                  this.setState(() => ({
                    signInLoading: true,
                  }))
                  this.props
                    .signIn(email)
                    .then(({ data }) => {
                      this.setState(() => ({
                        polling: true,
                        signInLoading: false,
                        signInResponse: data.signIn,
                      }))
                    })
                    .catch((error) => {
                      this.setState(() => ({
                        signInError: error,
                        signInLoading: false,
                      }))
                    })
                }}
              >
                {t('merci/postpay/signInError/retry')}
              </Button>
            )}
          </div>
          <Link
            href={{
              pathname: '/konto',
              query: { claim: query.id },
            }}
            passHref
          >
            <A>
              <br />
              <br />
              {t('merci/postpay/reclaim')}
            </A>
          </Link>
        </>
      )
    }

    if (me && ONBOARDING_PACKAGES.includes(query.package)) {
      return <Loader loading />
    }

    const buttonStyle = { marginBottom: 10, marginRight: 10 }
    const noNameSuffix = me?.name ? '' : '/noName'

    const leads = t
      .first([`merci/lead/package/${query.package || 'UNKOWN'}`, 'merci/lead'])
      .split('\n\n')
      .filter(Boolean)

    return (
      <>
        <H1>
          {t.first(
            [
              `merci/title/package/${query.package || 'UNKOWN'}${noNameSuffix}`,
              `merci/title${noNameSuffix}`,
            ],
            {
              name: me?.name,
            },
          )}
        </H1>
        {leads.map((lead, i) => (
          <div key={`lead${i}`} style={{ margin: '22px 0' }}>
            <Meta.Lead>{lead}</Meta.Lead>
          </div>
        ))}
        <WithAccess
          render={() => (
            <>
              <Link href='/' passHref>
                <Button primary style={{ ...buttonStyle, marginTop: 10 }}>
                  {t('merci/action/read')}
                </Button>
              </Link>
              <Link href='/dialog' passHref>
                <Button primary style={{ ...buttonStyle, marginTop: 10 }}>
                  {t('merci/action/dialog')}
                </Button>
              </Link>
            </>
          )}
        />
        <div style={{ marginTop: 50 }}>{children}</div>
      </>
    )
  }
}

export default compose(withMe, withT, withSignIn, withRouter)(Merci)
