import { MyBelongingsDocument } from '#graphql/republik-api/__generated__/gql/graphql'

import { Fragment, useEffect, useState, useRef } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import AutosizeInput from 'react-textarea-autosize'

import { timeFormat } from '../../../lib/utils/format'
import withT from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'
import { Item, P } from '../Elements'

import {
  Loader,
  A,
  Field,
  Radio,
  Button,
  Interaction,
  InlineSpinner,
} from '@project-r/styleguide'

import { useRouter } from 'next/router'
import Link from 'next/link'

const dayFormat = timeFormat('%d. %B %Y')

export const styles = {
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
    background: 'transparent',
  }),
}

const cancellationCategories = gql`
  query cancellationCategories {
    cancellationCategories {
      type
      label
    }
  }
`

const cancelMembership = gql`
  mutation cancelMembership($id: ID!, $details: CancellationInput!) {
    cancelMembership(id: $id, details: $details) {
      id
      active
      renew
    }
  }
`

const CancelMembership = ({
  redirectMemberships,
  loading,
  error,
  membership,
  cancel,
  cancellationCategories,
  t,
}) => {
  const router = useRouter()
  const [cancellationType, setCancellationType] = useState('')

  const needsReason = ['OTHER', 'EDITORIAL'].includes(cancellationType)
  const [reason, setReason] = useState({
    value: '',
  })
  const reasonRef = useRef()
  const reasonError =
    needsReason &&
    !reason.value.trim() &&
    t('memberships/cancel/description/empty')

  const isMoneyReason = ['TOO_EXPENSIVE', 'NO_MONEY'].includes(cancellationType)

  const [remoteState, setRemoteState] = useState({
    processing: false,
    success: false,
    error: null,
  })

  useEffect(() => {
    if (redirectMemberships && redirectMemberships.length) {
      if (redirectMemberships.length > 1) {
        router.push('/konto')
      } else {
        router.replace({
          pathname: '/abgang',
          query: {
            membershipId: redirectMemberships[0].id,
          },
        })
      }
    }
  }, [redirectMemberships])

  useEffect(() => {
    setReason((reason) => ({ ...reason, dirty: false }))
    if (needsReason) {
      reasonRef.current.focus()
    }
  }, [needsReason])

  return (
    <Loader
      loading={loading}
      error={
        error || (!membership && !loading && t('memberships/cancel/notFound'))
      }
      render={() => {
        const latestPeriod = membership.periods[0]
        const formattedEndDate =
          latestPeriod && dayFormat(new Date(latestPeriod.endDate))
        if (remoteState.success || !membership.renew) {
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
          <Fragment>
            <Interaction.H1>{t('memberships/cancel/title')}</Interaction.H1>
            {remoteState.error && <ErrorMessage error={remoteState.error} />}
            <Item
              createdAt={new Date(membership.createdAt)}
              title={t(`memberships/title/${membership.type.name}`, {
                sequenceNumber: membership.sequenceNumber,
              })}
            >
              {!!latestPeriod && (
                <P>
                  {membership.active &&
                    !membership.overdue &&
                    t.first(
                      [
                        `memberships/${membership.type.name}/latestPeriod/renew/${membership.renew}/autoPay/${membership.autoPay}`,
                        `memberships/latestPeriod/renew/${membership.renew}/autoPay/${membership.autoPay}`,
                      ],
                      { formattedEndDate },
                      '',
                    )}
                </P>
              )}
            </Item>
            <Interaction.P style={{ marginBottom: 5 }}>
              {t('memberships/cancel/info')}
            </Interaction.P>
            {cancellationCategories.map(({ type, label }) => (
              <div key={type}>
                <Radio
                  value={cancellationType}
                  checked={cancellationType === type}
                  onChange={() => setCancellationType(type)}
                >
                  {label}
                </Radio>
              </div>
            ))}
            <div
              style={{
                display: needsReason ? 'block' : 'none',
                marginTop: 20,
              }}
            >
              <Field
                ref={reasonRef}
                label={t('memberships/cancel/description')}
                value={reason.value}
                error={reason.dirty && reasonError}
                renderInput={({ ref, ...inputProps }) => (
                  <AutosizeInput
                    {...styles.autoSize}
                    {...inputProps}
                    inputRef={ref}
                  />
                )}
                onChange={(_, value, shouldValidate) => {
                  setReason({ value, dirty: shouldValidate })
                }}
              />
            </div>
            {isMoneyReason && (
              <Interaction.P style={{ marginTop: 20 }}>
                {t('memberships/cancel/userPrice')}{' '}
                <Link
                  href={{
                    pathname: '/angebote',
                    query: {
                      package: membership.canProlong ? 'PROLONG' : 'ABO',
                      userPrice: 1,
                    },
                  }}
                  legacyBehavior
                >
                  <A>{t('memberships/cancel/userPriceLink')}</A>
                </Link>
              </Interaction.P>
            )}
            <Button
              style={{ marginTop: '30px' }}
              primary={!remoteState.processing}
              disabled={remoteState.processing || !cancellationType}
              onClick={() => {
                if (reasonError) {
                  setReason({ ...reason, dirty: true })
                  reasonRef.current.focus()
                  return
                }
                setRemoteState({
                  processing: true,
                })
                cancel({
                  id: membership.id,
                  details: {
                    type: cancellationType,
                    reason: needsReason ? reason.value : '',
                  },
                })
                  .then(() => {
                    setRemoteState({
                      success: true,
                    })
                  })
                  .catch((error) => {
                    setRemoteState({
                      error,
                    })
                  })
              }}
            >
              {remoteState.processing ? (
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
          </Fragment>
        )
      }}
    />
  )
}

export default compose(
  graphql(cancelMembership, {
    props: ({ mutate }) => ({
      cancel: (variables) => mutate({ variables }),
    }),
  }),
  graphql(cancellationCategories, {
    props: ({ data, ownProps: { error, loading } }) => ({
      cancellationCategories: data.cancellationCategories,
      loading: loading || data.loading,
      error: error || data.error,
    }),
  }),
  graphql(MyBelongingsDocument, {
    props: ({
      data,
      ownProps: { membershipId, error, loading: categoryLoading },
    }) => {
      const memberships = data.me && data.me.memberships
      const membership =
        memberships && memberships.find((v) => v.id === membershipId)
      const redirectMemberships =
        !membership &&
        memberships &&
        memberships.filter((v) => v.active && v.renew)
      const loading =
        (redirectMemberships && redirectMemberships.length > 0) ||
        categoryLoading ||
        data.loading

      return {
        membership: membership,
        loading,
        redirectMemberships,
        error: error || data.error,
      }
    },
  }),
  withT,
)(CancelMembership)
