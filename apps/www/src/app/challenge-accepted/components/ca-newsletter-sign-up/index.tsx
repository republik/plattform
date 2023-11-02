import { ReactNode } from 'react'
import { MeQueryResult } from '@app/graphql/republik-api/me.query'
import { getClient } from '@app/lib/apollo/client'
import { EmailSignUp } from './email-signup'
import {
  CANewsletterQueryResult,
  CANewsletterQueryVariables,
  CA_NEWSLETTER_QUERY,
} from '@app/graphql/republik-api/newsletter.query'

type CANewsletterSignUpProps = {
  me?: MeQueryResult['me']
  // Override the default heading
  title?: string
  // Text that is shown between the heading & the form
  description?: ReactNode
}

const NEWSLETTER_NAME = 'CLIMATE'

export async function CANewsletterSignUp({
  me,
  title,
  description,
}: CANewsletterSignUpProps) {
  const { data } = await getClient().query<
    CANewsletterQueryResult,
    CANewsletterQueryVariables
  >({
    query: CA_NEWSLETTER_QUERY,
    variables: {
      name: 'CLIMATE',
    },
  })

  const climateNLSettings = data?.me?.newsletterSettings?.subscriptions?.find(
    (nl) => nl.name === NEWSLETTER_NAME,
  )
  if (me && climateNLSettings?.subscribed) {
    return null
  }

  // Case not logged in or not subscribed
  return (
    <EmailSignUp
      me={me}
      newsletterSetting={climateNLSettings}
      title={title}
      description={description}
      newsletterName={NEWSLETTER_NAME}
    />
  )
}
