import {
  CancellationCategoriesDocument,
  CancellationCategoryType,
  CancelMagazineSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { useMutation, useQuery } from '@apollo/client'
import { css } from 'glamor'
import { Fragment, useState } from 'react'
import AutosizeInput from 'react-textarea-autosize'

import { useTranslation } from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'

import {
  A,
  Button,
  Field,
  InlineSpinner,
  Interaction,
  Loader,
} from '@project-r/styleguide'

import Link from 'next/link'

export const styles = {
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
    background: 'transparent',
  }),
}

export function CancelMagazineSubscription({
  subscriptionId,
}: {
  subscriptionId: string
}) {
  const { t } = useTranslation()

  console.log({ subscriptionId })

  const { data, loading, error } = useQuery(CancellationCategoriesDocument)
  const [cancelSubscription, cancelState] = useMutation(
    CancelMagazineSubscriptionDocument,
  )

  const [cancellationType, setCancellationType] = useState('')

  const needsReason = ['OTHER', 'EDITORIAL'].includes(cancellationType)

  if (cancelState.data?.cancelMagazineSubscription) {
    return (
      <Fragment>
        <Interaction.H1>
          {t('memberships/cancel/confirmation/title')}
        </Interaction.H1>
        <Interaction.P style={{ margin: '20px 0' }}>
          {t('memberships/cancel/confirmation')}
        </Interaction.P>
        <Interaction.P style={{ margin: '20px 0' }}>
          <Link href='/cockpit' passHref legacyBehavior>
            <A>{t('memberships/cancel/confirmation/cockpit')}</A>
          </Link>
          <br />
          <Link href='/konto' passHref legacyBehavior>
            <A>{t('memberships/cancel/accountLink')}</A>
          </Link>
        </Interaction.P>
      </Fragment>
    )
  }

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault()

              const data = new FormData(e.currentTarget)

              const type = (
                data.get('cancellationType') ?? CancellationCategoryType.Other
              ).toString() as CancellationCategoryType
              const reason = (data.get('reason') ?? '').toString()

              cancelSubscription({
                variables: {
                  subscriptionId,
                  details: {
                    type,
                    reason,
                  },
                },
              })
            }}
          >
            <Interaction.H1>{t('memberships/cancel/title')}</Interaction.H1>
            {cancelState.error && (
              <ErrorMessage error={cancelState.error} style={{}}>
                {''}
              </ErrorMessage>
            )}

            <Interaction.P style={{ marginBottom: 5 }}>
              {t('memberships/cancel/info')}
            </Interaction.P>

            <div
              {...css({ display: 'flex', flexDirection: 'column', gap: 12 })}
            >
              {data?.cancellationCategories.map(({ type, label }) => (
                <p key={type}>
                  <label htmlFor={type}>
                    <input
                      type='radio'
                      name='cancellationType'
                      id={type}
                      value={type}
                      required
                      onChange={() => {
                        setCancellationType(type)
                      }}
                    ></input>{' '}
                    {label}
                  </label>
                </p>
              ))}
            </div>
            {needsReason && (
              <div
                style={{
                  marginTop: 20,
                }}
              >
                <Field
                  name='reason'
                  label={'Erläuterungen'}
                  renderInput={(props) => (
                    <AutosizeInput
                      {...styles.autoSize}
                      {...props}
                      name='reason'
                      required
                    />
                  )}
                />
              </div>
            )}

            <Button
              type='submit'
              style={{ marginTop: '30px' }}
              primary
              disabled={cancelState.loading}
            >
              {cancelState.loading ? (
                <InlineSpinner size={28} />
              ) : (
                t('memberships/cancel/button')
              )}
            </Button>
            <br />
            <br />
            <Link href='/konto' passHref legacyBehavior>
              <A>{t('memberships/cancel/accountLink')}</A>
            </Link>
          </form>
        )
      }}
    />
  )
}
