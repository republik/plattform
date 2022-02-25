import React from 'react'
import gql from 'graphql-tag'
import { A } from '@project-r/styleguide'

import { Date, Subject } from '../Mailbox/List'
import { fragments as mailboxFragments } from '../Mailbox/utils'

import { styles } from './utils'

export const fragments = gql`
  fragment MailsFragment on MailboxConnection {
    nodes {
      ...MailboxRecordFragment
    }
  }

  ${mailboxFragments.record}
`

const Mails = ({ mails }) => {
  if (!mails?.length) {
    return null
  }

  return (
    <div>
      {mails.map((mail) => {
        return (
          <div key={mail.id} {...styles.mail}>
            <div>
              <Date mail={mail} />
            </div>
            <A href={`/mailbox?mailId=${mail.id}`} target='_blank'>
              <Subject mail={mail} />
            </A>
          </div>
        )
      })}
    </div>
  )
}

export default Mails
