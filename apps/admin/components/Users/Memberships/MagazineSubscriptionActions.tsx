'use client'

import {
  CancellationCategoriesDocument,
  CancellationCategoryType,
  CancelMagazineSubscriptionDocument,
  CancelUpgradeMagazineSubscriptionDocument,
  ReactivateMagazineSubscriptionDocument,
  UserMagazineSubscriptionsQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Field } from '@project-r/styleguide'
import { css } from '@republik/theme/css'
import { Button, SimpleDialog } from '@republik/ui'
import { TextButton } from 'components/Display/utils'
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
  const [cancelUpgrade] = useMutation(CancelUpgradeMagazineSubscriptionDocument)

  const { t } = useTranslation()

  const [confirmAction, setConfirmAction] = useState<
    'cancel' | 'reactivate' | 'cancelUpgrade' | undefined
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
      ) : confirmAction === 'cancelUpgrade' ? (
        <ConfirmOverlay
          title={`Wechsel auf ${t(
            `account/MagazineSubscription/type/${subscription.upgrade?.subscriptionType}`,
          )} abbrechen`}
          buttonLabel='Wechsel abbrechen'
          error={submissionError}
          close={reset}
          action={() => {
            cancelUpgrade({
              variables: {
                subscriptionId: subscription.id,
              },
            })
              .then(reset)
              .catch((err) => {
                setSubssionError(err)
              })
          }}
        >
          Das {t(`account/MagazineSubscription/type/${subscription.type}`)} wird
          wieder reaktiviert, wenn es nicht vor dem Wechsel schon gekündigt war.
        </ConfirmOverlay>
      ) : null}
      {subscription.upgrade ? (
        <TextButton
          onClick={() => {
            setConfirmAction('cancelUpgrade')
          }}
        >
          Wechsel abbrechen
        </TextButton>
      ) : subscription.canceledAt ? (
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
    <SimpleDialog
      title={title}
      trigger={null}
      open
      onOpenChange={(open) => {
        if (!open) {
          close()
        }
      }}
    >
      <>
        {error && (
          <div
            className={css({
              background: 'error',
              color: 'white',
              padding: '4',
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
          <div
            className={css({
              marginBlock: '4',
            })}
          >
            {children}
          </div>

          <Button type='submit'>{buttonLabel}</Button>
        </form>
      </>
    </SimpleDialog>
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
