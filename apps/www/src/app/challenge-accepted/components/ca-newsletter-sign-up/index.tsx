import { ReactNode } from 'react'
import { getClient } from '@app/lib/apollo/client'
import { EmailSignUp } from './email-signup'
import {
  CaNewsletterDocument,
  MeQuery,
  NewsletterName,
} from '#graphql/republik-api/__generated__/gql/graphql'

type CANewsletterSignUpProps = {
  me?: MeQuery['me']
  // Override the default heading
  title?: string
  // Text that is shown between the heading & the form
  description?: ReactNode
  // Tagline below the form
  tagline?: string
  id?: string
}

const NEWSLETTER_NAME: NewsletterName = NewsletterName.Climate

export async function CANewsletterSignUp({
  me,
  title,
  description,
  tagline,
  id,
}: CANewsletterSignUpProps) {
  const { data } = await getClient().query({
    query: CaNewsletterDocument,
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
      tagline={tagline}
      newsletterName={NEWSLETTER_NAME}
      id={id}
    />
  )
}
