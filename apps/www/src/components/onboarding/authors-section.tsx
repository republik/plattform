import {
  OnboardingAuthorDocument,
  User,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { AUTHORS_FEATURED } from '@app/components/onboarding/config'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import {
  OnboardingFollowButton,
  OnboardingH3,
  OnboardingSection,
} from './onboarding-ui'

function AuthorCard({ slug }: { slug: string }) {
  const [isPending, setIsPending] = useState(false)
  const { data } = useQuery(OnboardingAuthorDocument, {
    variables: { slug },
  })

  const author = data?.user as User

  if (!author) return null

  return (
    <div className={css({ display: 'flex', alignItems: 'center', gap: 2 })}>
      <img
        width='96'
        className={css({ borderRadius: '96px' })}
        src={author.portrait}
      />
      <div>
        <h4 className={css({ fontWeight: 'bold' })}>{author.name}</h4>
        <p className={css({ color: 'textSoft' })}>Big Tech</p>
      </div>
      <div className={css({ ml: 'auto' })}>
        <OnboardingFollowButton
          onClick={(e) => undefined}
          subscribed={false}
          isPending={isPending}
        />
      </div>
    </div>
  )
}

function AuthorsSection() {
  return (
    <OnboardingSection>
      <OnboardingH3>Unsere Autorinnen</OnboardingH3>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        })}
      >
        {AUTHORS_FEATURED.map((slug) => (
          <AuthorCard slug={slug} key={slug} />
        ))}
      </div>
    </OnboardingSection>
  )
}

export default AuthorsSection
