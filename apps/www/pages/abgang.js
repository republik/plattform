import React, { Fragment } from 'react'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import withT from '../lib/withT'
import withMe from '../lib/apollo/withMe'

import Frame from '../components/Frame'
import Cancel from '../components/Account/Memberships/Cancel'
import SignIn from '../components/Auth/SignIn'

import { Interaction } from '@project-r/styleguide'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'

const CancelMembershipPage = ({ router, me, t }) => {
  const { membershipId } = router.query

  const meta = {
    title: t('memberships/cancel/title'),
    description: '',
  }

  return (
    <Frame meta={meta}>
      {me ? (
        <Cancel membershipId={membershipId} />
      ) : (
        <Fragment>
          <Interaction.H1>{meta.title}</Interaction.H1>
          <br />
          <SignIn
            context='cancel'
            beforeForm={
              <Interaction.P style={{ marginBottom: 20 }}>
                {t('memberships/cancel/signIn')}
              </Interaction.P>
            }
          />
        </Fragment>
      )}
    </Frame>
  )
}

export default withDefaultSSR(
  compose(withRouter, withT, withMe)(CancelMembershipPage),
)
