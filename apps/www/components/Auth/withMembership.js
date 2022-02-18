import React, { Fragment } from 'react'
import compose from 'lodash/flowRight'

import { useTranslation } from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { useInNativeApp } from '../../lib/withInNativeApp'

import Frame from '../Frame'
import SignIn from './SignIn'
import Me from './Me'

import { Interaction, A } from '@project-r/styleguide'

import withAuthorization, { PageCenter } from './withAuthorization'
import { withMembership } from './checkRoles'
import Link from 'next/link'
import { useMe } from '../../lib/context/MeContext'

export const UnauthorizedMessage = ({
  unauthorizedTexts: { title, description } = {},
}) => {
  const { me } = useMe()
  const { inNativeIOSApp } = useInNativeApp()
  const { t } = useTranslation()

  if (inNativeIOSApp) {
    return (
      <Fragment>
        {me && (
          <Interaction.H1 style={{ marginBottom: 10 }}>
            {t('withMembership/ios/unauthorized/title')}
          </Interaction.H1>
        )}
        <br />
        <Me
          beforeSignedInAs={
            <Fragment>
              <Interaction.P style={{ marginBottom: 20 }}>
                {t('withMembership/ios/unauthorized/noMembership')}
              </Interaction.P>
            </Fragment>
          }
          beforeSignInForm={
            <Fragment>
              <Interaction.P style={{ marginBottom: 20 }}>
                {t('withMembership/ios/unauthorized/signIn')}
              </Interaction.P>
            </Fragment>
          }
        />
      </Fragment>
    )
  }
  if (me) {
    return (
      <Fragment>
        <Interaction.H1>{t('withMembership/title')}</Interaction.H1>
        <Interaction.P>
          {t.elements('withMembership/unauthorized', {
            buyLink: (
              <Link key='pledge' href='/angebote' passHref>
                <A>{t('withMembership/unauthorized/buyText')}</A>
              </Link>
            ),
            accountLink: (
              <Link key='account' href='/konto' passHref>
                <A>{t('withMembership/unauthorized/accountText')}</A>
              </Link>
            ),
          })}
          <br />
        </Interaction.P>
        <br />
        <Me />
      </Fragment>
    )
  }
  return (
    <Fragment>
      <Interaction.H1>{title || t('withMembership/title')}</Interaction.H1>
      <br />
      <SignIn
        beforeForm={
          <Interaction.P style={{ marginBottom: 20 }}>
            {description ||
              t.elements('withMembership/signIn/note', {
                buyLink: (
                  <Link key='pledge' href='/angebote' passHref>
                    <A>{t('withMembership/signIn/note/buyText')}</A>
                  </Link>
                ),
                moreLink: (
                  <Link key='index' href='/' passHref>
                    <A>{t('withMembership/signIn/note/moreText')}</A>
                  </Link>
                ),
              })}
          </Interaction.P>
        }
      />
    </Fragment>
  )
}

const UnauthorizedPage = ({ meta, unauthorizedTexts }) => (
  <Frame meta={meta} raw>
    <PageCenter>
      <UnauthorizedMessage unauthorizedTexts={unauthorizedTexts} />
    </PageCenter>
  </Frame>
)

export const WithoutMembership = withAuthorization(['member'])(
  ({ isAuthorized, render }) => {
    if (!isAuthorized) {
      return render()
    }
    return null
  },
)

export const WithoutActiveMembership = compose(
  withMe,
  withAuthorization(['member']),
)(({ me, render }) => {
  if (me && me.activeMembership) {
    return null
  }

  return render()
})

export const WithMembership = withAuthorization(['member'])(
  ({ isAuthorized, render }) => {
    if (isAuthorized) {
      return render()
    }
    return null
  },
)

export const WithActiveMembership = compose(
  withMe,
  withAuthorization(['member']),
)(({ me, render }) => {
  if (me && me.activeMembership) {
    return render()
  }

  return null
})

export const enforceMembership =
  (meta, unauthorizedTexts) => (WrappedComponent) =>
    withAuthorization(['member'])(({ isAuthorized, ...props }) => {
      if (isAuthorized) {
        return <WrappedComponent meta={meta} {...props} />
      }
      return (
        <UnauthorizedPage meta={meta} unauthorizedTexts={unauthorizedTexts} />
      )
    })

export default withMembership
