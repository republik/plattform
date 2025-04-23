'use client'

import {
  CancellationCategoriesDocument,
  CancellationCategoryType,
  CancelMagazineSubscriptionDocument,
  ReactivateMagazineSubscriptionDocument,
  UserMagazineSubscriptionsQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import {
  Button,
  Field,
  Interaction,
  Overlay,
  OverlayBody,
  OverlayToolbar,
} from '@project-r/styleguide'
import { useState } from 'react'
import TextareaAutosize from 'react-autosize-textarea'

type MagazineSubscription = NonNullable<
  UserMagazineSubscriptionsQuery['user']['magazineSubscriptions'][number]
>

export function MagazineSubscriptionActions({
  subscription,
  refetchSubscriptions,
}: {
  subscription: MagazineSubscription
  refetchSubscriptions: () => void
}) {
  const [cancelSubscription] = useMutation(CancelMagazineSubscriptionDocument)
  const [reactivateSubscription] = useMutation(
    ReactivateMagazineSubscriptionDocument,
  )

  const [confirmAction, setConfirmAction] = useState<
    'cancel' | 'reactivate' | undefined
  >()

  return (
    <>
      {confirmAction === 'cancel' ? (
        <CancelOverlay
          close={() => setConfirmAction(undefined)}
          action={(data: FormData) => {
            const type = (
              data.get('cancellationType') ?? CancellationCategoryType.System
            ).toString() as CancellationCategoryType
            const reason = (data.get('reason') ?? '').toString()
            const suppressConfirmation = Boolean(
              data.get('suppressConfirmation'),
            )
            const suppressWinback = Boolean(data.get('suppressWinback'))
            const cancelImmediately = Boolean(data.get('cancelImmediately'))

            cancelSubscription({
              variables: {
                subscriptionId: subscription.id,
                cancelImmediately,
                details: {
                  type,
                  reason,
                  suppressConfirmation,
                  suppressWinback,
                },
              },
            }).then((res) => {
              console.log(res)
              refetchSubscriptions()
              setConfirmAction(undefined)
            })
          }}
        />
      ) : confirmAction === 'reactivate' ? (
        <ConfirmOverlay
          title='Subscription reaktivieren?'
          close={() => setConfirmAction(undefined)}
          action={() => {
            reactivateSubscription({
              variables: {
                subscriptionId: subscription.id,
              },
            }).then((res) => {
              console.log(res)
              refetchSubscriptions()
              setConfirmAction(undefined)
            })
          }}
        />
      ) : null}
      {subscription.canceledAt ? (
        !subscription.endedAt && (
          <Button
            small
            onClick={() => {
              setConfirmAction('reactivate')
            }}
          >
            Reaktivieren
          </Button>
        )
      ) : (
        <Button
          small
          onClick={() => {
            setConfirmAction('cancel')
          }}
        >
          Kündigen
        </Button>
      )}
    </>
  )
}

function ConfirmOverlay({
  title,
  action,
  close,
}: {
  title: string
  action: (data: FormData) => void
  close: () => void
}) {
  return (
    <Overlay onClose={() => close()}>
      <OverlayToolbar onClose={() => close()} />
      <OverlayBody>
        <Interaction.H2>{title}</Interaction.H2>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            action(new FormData(e.currentTarget))
          }}
        >
          <Button primary type='submit'>
            OK
          </Button>
        </form>
      </OverlayBody>
    </Overlay>
  )
}

function CancelOverlay({
  action,
  close,
}: {
  action: (data: FormData) => void
  close: () => void
}) {
  const { data, loading, error } = useQuery(CancellationCategoriesDocument)

  if (error) {
    return 'Upsi, Kündigungsgründe konnten nicht geladen werden'
  }

  if (loading || !data.cancellationCategories) {
    return null
  }

  const { cancellationCategories } = data

  return (
    <Overlay onClose={() => close()}>
      <OverlayToolbar onClose={() => close()} />
      <OverlayBody>
        <Interaction.H2>Kündigen</Interaction.H2>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            action(new FormData(e.currentTarget))
          }}
        >
          {cancellationCategories &&
            cancellationCategories.map(({ type, label }) => (
              <p key={type}>
                <label htmlFor={type}>
                  <input
                    type='radio'
                    name='cancellationType'
                    id={type}
                    value={type}
                    required
                  ></input>{' '}
                  {label}
                </label>
              </p>
            ))}
          <Field
            name='reason'
            label={'Erläuterungen'}
            required
            renderInput={(props) => (
              <TextareaAutosize {...props} style={{ lineHeight: '30px' }} />
            )}
          />
          <p>
            <label htmlFor='cancelImmediately'>
              <input
                type='checkbox'
                name='cancelImmediately'
                id='cancelImmediately'
              ></input>{' '}
              Sofort kündigen
            </label>
          </p>
          <p>
            <label htmlFor='suppressConfirmation'>
              <input
                type='checkbox'
                name='suppressConfirmation'
                id='suppressConfirmation'
              ></input>{' '}
              Kündigungsbestätigung unterdrücken
            </label>
          </p>
          <p>
            <label htmlFor='suppressWinback'>
              <input
                type='checkbox'
                name='suppressWinback'
                id='suppressWinback'
              ></input>{' '}
              Winback unterdrücken
            </label>
          </p>
          <Button primary type='submit'>
            Speichern
          </Button>
        </form>
      </OverlayBody>
    </Overlay>
  )
}
