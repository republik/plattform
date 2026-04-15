import { MyBelongingsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { graphql } from '@apollo/client/react/hoc'

import { A, Interaction } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import Link from 'next/link'

import { timeFormat } from '../../lib/utils/format'
import withInNativeApp from '../../lib/withInNativeApp'
import withT from '../../lib/withT'

const { P } = Interaction

const dayFormat = timeFormat('%e. %B %Y')

const AccessGrants = ({ accessGrants, inNativeApp, t }) => {
  const maxEndAt =
    accessGrants.length > 0 &&
    accessGrants.reduce(
      (acc, grant) =>
        new Date(grant.endAt) > acc ? new Date(grant.endAt) : acc,
      new Date(),
    )

  return maxEndAt ? (
    <P>
      {t.elements('Account/Access/Grants/message/claimed', {
        maxEndAt: <span>{dayFormat(new Date(maxEndAt))}</span>,
      })}
      {!inNativeApp && (
        <>
          {' '}
          <Link href='/angebote' key='pledge' passHref legacyBehavior>
            <A>
              <strong>{t('Account/Access/Grants/link/pledges')}</strong>
            </A>
          </Link>
        </>
      )}
    </P>
  ) : null
}

export default compose(
  graphql(MyBelongingsDocument, {
    props: ({ data }) => ({
      accessGrants:
        (!data.loading && !data.error && data.me && data.me.accessGrants) || [],
    }),
  }),
  withT,
  withInNativeApp,
)(AccessGrants)
