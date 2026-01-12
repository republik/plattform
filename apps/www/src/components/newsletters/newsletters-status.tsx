import { NewslettersResubscribeDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { Button } from '@app/components/ui/button'
import { css } from '@republik/theme/css'
import { useTranslation } from 'lib/withT'

export function NewslettersStatus({
  userId,
  status,
}: {
  userId: string
  status: string
}) {
  const { t } = useTranslation()
  const [resubscribe, { data, loading, error }] = useMutation(
    NewslettersResubscribeDocument,
    { variables: { userId } },
  )

  if (status === 'subscribed') {
    return null
  }

  return (
    <div
      data-theme='light'
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        alignItems: 'flex-start',
        color: 'text',
        backgroundColor: 'background.marketing',
        p: '8',
        mb: '16',
      })}
    >
      {data?.resubscribeEmail.status === 'pending' ? (
        <>
          <p>{t('account/newsletterSubscriptions/resubscribed')}</p>
        </>
      ) : status === 'unsubscribed' ? (
        <>
          <p>{t('account/newsletterSubscriptions/unsubscribed')}</p>

          <Button
            onClick={() => {
              resubscribe()
            }}
            loading={loading}
          >
            {t('account/newsletterSubscriptions/resubscribe')}
          </Button>
        </>
      ) : status === 'pending' ? (
        <>
          <p>{t('account/newsletterSubscriptions/resubscribeEmailPending')}</p>

          <Button
            onClick={() => {
              resubscribe()
            }}
            loading={loading}
            size='small'
            variant='outline'
          >
            {t('account/newsletterSubscriptions/resendResubscribeEmail')}
          </Button>
        </>
      ) : null}
    </div>
  )
}
