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
  colors,
  Field,
  Interaction,
  Overlay,
  OverlayBody,
  OverlayToolbar,
} from '@project-r/styleguide'
import { TextButton } from 'components/Display/utils'
import { css } from 'glamor'
import { useTranslation } from 'lib/useT'
import { ReactNode, useState } from 'react'
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

  const { t } = useTranslation()

  const [confirmAction, setConfirmAction] = useState<
    'cancel' | 'reactivate' | undefined
  >()

  const [submissionError, setSubssionError] = useState<Error | undefined>()

  const reset = () => {
    setConfirmAction(undefined)
    setSubssionError(undefined)
    refetchSubscriptions()
  }

  return (
    <>
      {confirmAction === 'cancel' ? (
        <CancelOverlay
          title={`${t(
            `account/MagazineSubscription/type/${subscription.type}`,
          )} kündigen`}
          buttonLabel='Kündigen'
          error={submissionError}
          close={reset}
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
            })
              .then(reset)
              .catch((err) => {
                setSubssionError(err)
              })
          }}
        />
      ) : confirmAction === 'reactivate' ? (
        <ConfirmOverlay
          title={`${t(
            `account/MagazineSubscription/type/${subscription.type}`,
          )} reaktivieren`}
          buttonLabel='Reaktivieren'
          error={submissionError}
          close={reset}
          action={() => {
            reactivateSubscription({
              variables: {
                subscriptionId: subscription.id,
              },
            })
              .then(reset)
              .catch((err) => {
                setSubssionError(err)
              })
          }}
        ></ConfirmOverlay>
      ) : null}
      {subscription.canceledAt ? (
        !subscription.endedAt && (
          <TextButton
            onClick={() => {
              setConfirmAction('reactivate')
            }}
          >
            Reaktivieren
          </TextButton>
        )
      ) : (
        <TextButton
          small
          onClick={() => {
            setConfirmAction('cancel')
          }}
        >
          Kündigen
        </TextButton>
      )}
    </>
  )
}

type ConfirmOverlayProps = {
  title: string
  buttonLabel?: string
  error?: Error
  action: (data: FormData) => void
  close: () => void
  children?: ReactNode
}

function ConfirmOverlay({
  title,
  buttonLabel = 'OK',
  error,
  action,
  close,
  children,
}: ConfirmOverlayProps) {
  return (
    <Overlay onClose={() => close()}>
      <OverlayToolbar onClose={() => close()} />
      <OverlayBody>
        <Interaction.H2 style={{ marginBottom: '1rem' }}>
          {title}
        </Interaction.H2>

        {error && (
          <div
            {...css({
              background: colors.error,
              color: 'white',
              padding: '1rem',
            })}
          >
            {error.message}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            action(new FormData(e.currentTarget))
          }}
        >
          {children}

          <Button primary type='submit'>
            {buttonLabel}
          </Button>
        </form>
      </OverlayBody>
    </Overlay>
  )
}

function CancelOverlay(props: Omit<ConfirmOverlayProps, 'children'>) {
  const {
    data,
    loading,
    error: categoriesError,
  } = useQuery(CancellationCategoriesDocument)

  if (loading || !data.cancellationCategories) {
    return null
  }

  const { cancellationCategories } = data

  return (
    <ConfirmOverlay {...props} error={props.error ?? categoriesError}>
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
          Sofort kündigen (kann nicht reaktiviert werden)
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
    </ConfirmOverlay>
  )
}
