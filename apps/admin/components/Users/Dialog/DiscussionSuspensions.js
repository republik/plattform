import { gql, useMutation } from '@apollo/client'
import { Query } from '@apollo/client/react/components'
import {
  Section,
  SectionTitle,
  displayDate,
  SectionSubhead,
  DT,
  DD,
  dateDiff,
} from '../../Display/utils'
import {
  Loader,
  Label,
  Button,
  Field,
  Overlay,
  OverlayToolbar,
  OverlayBody,
  Dropdown,
} from '@project-r/styleguide'
import List, { Item } from '../../List'
import { useState } from 'react'

const GET_SUSPENSIONS = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      isSuspended
      suspendedUntil
      suspensions(withInactive: true) {
        beginAt
        endAt
        reason
      }
    }
  }
`

const SUSPEND_USER = gql`
  mutation SuspendUser($id: ID!, $until: DateTime, $reason: String) {
    suspendUser(id: $id, until: $until, reason: $reason) {
      id
    }
  }
`

const UNSUSPEND_USER = gql`
  mutation UnsuspendUser($id: ID!) {
    unsuspendUser(id: $id) {
      id
    }
  }
`

const SUSPENSION_INTERVALS = [
  {
    value: '1',
    text: '1 Tag',
  },
  {
    value: '7',
    text: '1 Woche',
  },
  {
    value: '30',
    text: '1 Monat',
  },
  {
    value: '365',
    text: '1 Jahr',
  },
]

const SuspendActions = ({ userId, isSuspended }) => {
  const [showSuspensionFields, setShowSuspensionFields] = useState(false)
  const [until, setUntil] = useState('7')
  const [reason, setReason] = useState('')
  const resetDialogForm = () => {
    setUntil('7')
    setReason('')
    setShowSuspensionFields(false)
  }
  const [suspendUser, suspendUserState] = useMutation(SUSPEND_USER, {
    variables: {
      id: userId,
      until:
        until !== ''
          ? new Date(Date.now() + parseInt(until, 10) * 1000 * 3600 * 24) // FIXME: What if parseInt fails?
          : undefined,
      reason: reason !== '' ? reason : undefined,
    },
    refetchQueries: [{ query: GET_SUSPENSIONS, variables: { id: userId } }],
  })

  const [unsuspendUser, unsuspendUserState] = useMutation(UNSUSPEND_USER, {
    variables: { id: userId },
    refetchQueries: [{ query: GET_SUSPENSIONS, variables: { id: userId } }],
  })

  if (isSuspended) {
    return (
      <Button
        small
        primary
        onClick={() => {
          resetDialogForm()
          unsuspendUser()
        }}
      >
        Entsperren
      </Button>
    )
  }

  if (showSuspensionFields) {
    return (
      <>
        <Overlay isVisible>
          <OverlayToolbar
            title='Sperren'
            onClose={() => {
              resetDialogForm()
            }}
          ></OverlayToolbar>

          <OverlayBody>
            <Dropdown
              label='Sperrung endet in'
              value={until}
              items={SUSPENSION_INTERVALS}
              onChange={(item) => {
                setUntil(item.value)
              }}
            ></Dropdown>
            <Field
              label='Grund für die Sperrung'
              value={reason}
              onChange={(e) => {
                setReason(e.currentTarget.value)
              }}
            ></Field>
            <Button
              primary
              onClick={() => {
                suspendUser()
              }}
            >
              Sperren
            </Button>
            <Button
              naked
              onClick={() => {
                resetDialogForm()
              }}
            >
              Abbrechen
            </Button>
          </OverlayBody>
        </Overlay>
      </>
    )
  }

  return (
    <>
      <Button
        small
        onClick={() => {
          setShowSuspensionFields(true)
        }}
      >
        Sperren
      </Button>
    </>
  )
}

const Suspensions = ({ userId }) => {
  return (
    <Section>
      <SectionTitle>Sperrungen</SectionTitle>
      <Query query={GET_SUSPENSIONS} variables={{ id: userId }}>
        {({ loading, error, data }) => {
          const isInitialLoading = loading && !(data && data.user)
          return (
            <Loader
              loading={isInitialLoading}
              error={error}
              render={() => {
                const { user } = data
                const { isSuspended, suspendedUntil, suspensions } = user
                const suspendedHeader = isSuspended
                  ? `gesperrt bis am ${displayDate(suspendedUntil)}`
                  : 'nicht gesperrt'
                return (
                  <div>
                    <SectionSubhead>Aktuell {suspendedHeader}</SectionSubhead>
                    <SuspendActions userId={userId} isSuspended={isSuspended} />
                    {!!suspensions.length && (
                      <SectionSubhead>Alle Sperrungen</SectionSubhead>
                    )}
                    <List>
                      {[...suspensions]
                        .sort((a, b) => {
                          return new Date(b.beginAt) - new Date(a.beginAt)
                        })
                        .map((suspension, i) => (
                          <Item key={i}>
                            <DT>
                              {displayDate(suspension.beginAt)} -{' '}
                              {displayDate(suspension.endAt)} (
                              {dateDiff(suspension.beginAt, suspension.endAt)})
                            </DT>
                            <DD>
                              <Label>
                                {suspension.reason
                                  ? suspension.reason
                                  : 'kein Grund angegeben'}
                              </Label>
                            </DD>
                          </Item>
                        ))}
                    </List>
                  </div>
                )
              }}
            />
          )
        }}
      </Query>
    </Section>
  )
}

export default Suspensions
