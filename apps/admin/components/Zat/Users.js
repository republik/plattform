import { gql } from '@apollo/client'
import { A } from '@project-r/styleguide'

import AccessGrants, {
  fragments as UserAccessGrants,
} from './User/AccessGrants'
import Memberships, { fragments as UserMemberships } from './User/Memberships'
import NewsletterSettings, {
  fragments as UserNewsletterSettings,
} from './User/NewsletterSettings'
import Sessions, { fragments as UserSessions } from './User/Sessions'

import { MagazineSubscriptions } from '@/components/Users/Memberships/MagazineSubscriptions'

import { styles } from './utils'

export const fragments = gql`
  fragment UsersFragment on Users {
    items {
      id
      email
      name
      ...UserMemberships
      ...UserAccessGrants
      ...UserNewsletterSettings
      ...UserSessions
    }
  }

  ${UserMemberships}
  ${UserAccessGrants}
  ${UserNewsletterSettings}
  ${UserSessions}
`

const Users = ({ email, name, users }) => {
  const matchingUser = users?.find((u) => u.email === email)
  const hasMatchingUsers = !!matchingUser

  return (
    <>
      {!hasMatchingUsers && (
        <div className={styles.hint}>
          Keinen User unter «{email || name}» gefunden.{' '}
          {!!email && !!users?.length && (
            <>
              User mit einer{' '}
              <A href={`/users?search=${encodeURI(email)}`} target='_blank'>
                ähnlichen E-Mail-Adresse
              </A>
              :
            </>
          )}
          {!email && !!name && !!users?.length && (
            <>
              User mit einem{' '}
              <A href={`/users?search=${encodeURI(name)}`} target='_blank'>
                ähnlichen Namen
              </A>
              :
            </>
          )}
        </div>
      )}
      {((hasMatchingUsers && [matchingUser]) || users)?.map(
        ({
          id,
          email,
          name,
          activeMembership,
          memberships,
          accessGrants,
          newsletterSettings,
          sessions,
        }) => (
          <div key={id} className={styles.item}>
            {/* Name, email address */}
            <div>
              <A href={`/users/${id}`} target='_blank'>
                {name || email}
              </A>
              {!matchingUser?.length && !!name && <div>{email}</div>}
            </div>
            <MagazineSubscriptions userId={id} />
            <Memberships
              activeMembership={activeMembership}
              memberships={memberships}
            />
            <AccessGrants accessGrants={accessGrants} />
            <NewsletterSettings newsletterSettings={newsletterSettings} />
            <Sessions sessions={sessions} />
          </div>
        ),
      )}
    </>
  )
}

export default Users
