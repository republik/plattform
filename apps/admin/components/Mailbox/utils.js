import { gql } from '@apollo/client'

const address = gql`
  fragment MailboxAddressFragment on MailboxAddress {
    id
    address
    name
    user {
      id
      name
    }
  }
`

const record = gql`
  fragment MailboxRecordFragment on MailboxRecord {
    id
    type
    template
    date
    status
    error
    from {
      ...MailboxAddressFragment
    }
    to {
      ...MailboxAddressFragment
    }
    cc {
      ...MailboxAddressFragment
    }
    bcc {
      ...MailboxAddressFragment
    }
    subject
    hasHtml
    links {
      id
      label
      url
    }
  }
  ${address}
`

const html = gql`
  fragment MailboxHtml on MailboxRecord {
    id
    html
  }
`

export const fragments = {
  address,
  record,
  html,
}
