# @orbiting/backend-modules-mailbox

Query mailbox index and mailLog table at once

## API

### Queries

- `mailbox`
- `User.mailbox`

Example

```gql
query recentMails {
  mailbox {
    nodes {
      date
      subject
    }
  }
}
```

```gql
query recentUserMails {
  user(slug:"peter.parker") {
    mailbox {
      nodes {
        date
        subject
      }
    }
  }
}
```

### Arguments

- `first`: Number, amount of nodes to return
- (`last`: _not implemented_)
- `before`: String, nodes before a cursor
- `after`: String, nodes after a cursor
- `filters.hasError`: Boolean, filter, only list nodes with mailing errors
- `filters.email`: String, filter, only list nodes with specified email address

Example:

```gql
query manyRecentEmails {
  mailbox(first: 100, filters: { hasError: true }) {
    totalCount
    nodes {
      date
    }
  }
}
```

### Response

Returns a `MailboxConnection`. Contains `totalCount`, `pageInfo` and `nodes` array.

- `totalCount`: Number, total amount of nodes search yielded
- `pageInfo.hasNextPage`: Boolean, indicates whether more nodes are available looking forward
- `pageInfo.hasPreviousPage`: Boolean, indicates whether more nodes are available looking backward
- `pageInfo.endCursor`: String, reference to last node in `nodes` array
- `pageInfo.startCursor`: String, reference to first node in `nodes` array

`nodes` array returns an array of `MailboxRecord`. It contains the following properties:

- `id`: String, an identifier
- `type`: String, type of email
- `template`: String, name of template used (_mailLog_ only)
- `date`: Date as ISO string, when email was sent
- `status`: String, whether email was sent (_mailLog_ only)
- `error`: String, whether an error occured while sending email (_mailLog_ only)
- `from`: `MailboxAddress`, sender
- `to`: Array of `MailboxAddress`, recipients
- `cc`: Array of `MailboxAddress`, additional recipients
- `bcc`: Array of `MailboxAddress`, hidden additional recipients
- `subject`: String, email subject
- `html`: String, email contents (`mailbox` only)
- `links`: Array of `MailboxLink`, related links e.g. content on mandrill

A `MailboxAddress` object contains following properties:

- `id`: String, an identifer
- `address`: String, an email address
- `name`: String, a label e.g. "Peter Parker"
- `user`: `User` retrievable via email address

