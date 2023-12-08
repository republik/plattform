import { ReactNode } from 'react'
import { getClient } from '@app/lib/apollo/client'
import { EmailSignUp } from './email-signup'
import { CA_NEWSLETTER_QUERY } from '@app/graphql/republik-api/newsletter.query'
import { MeQuery, NewsletterName } from '@app/graphql/republik-api/gql/graphql'

type CANewsletterSignUpProps = {
  me?: MeQuery['me']
  // Override the default heading
  title?: string
  // Text that is shown between the heading & the form
  description?: ReactNode
  id?: string
}

const NEWSLETTER_NAME: NewsletterName = NewsletterName.Climate

export async function CANewsletterSignUp({
  me,
  title,
  description,
  id,
}: CANewsletterSignUpProps) {
  const { data } = await getClient().query({
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
      id={id}
    />
  )
}
