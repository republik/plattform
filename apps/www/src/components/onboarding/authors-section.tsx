import {
  OnboardingAuthorDocument,
  SubscribeDocument,
  SubscriptionObjectType,
  UnsubscribeDocument,
  User,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { AUTHORS_FEATURED } from '@app/components/onboarding/config'
import { Button } from '@app/components/ui/button'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import {
  OnboardingFollowButton,
  OnboardingH3,
  OnboardingSection,
} from './onboarding-ui'

const AUTHORS_ALWAYS_SHOWN = 3

function AuthorCard({ slug }: { slug: string }) {
  const [isPending, setIsPending] = useState(false)
  const [subscribe] = useMutation(SubscribeDocument)
  const [unsubscribe] = useMutation(UnsubscribeDocument)
  const { data } = useQuery(OnboardingAuthorDocument, {
    variables: { slug },
  })

  const author = data?.user as User
  if (!author) return null

  const subscriptionId = author.subscribedBy.nodes.find((n) => n.active)?.id

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    if (subscriptionId) {
      await unsubscribe({
        variables: {
          subscriptionId,
        },
      })
    } else {
      await subscribe({
        variables: {
          objectId: author.id,
          type: SubscriptionObjectType.User,
        },
      })
    }
    setIsPending(false)
  }

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
          onClick={toggleSubscription}
          subscribed={!!subscriptionId}
          isPending={isPending}
        />
      </div>
    </div>
  )
}

function AuthorsSection() {
  const [showAll, setShowAll] = useState(false)

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
        {AUTHORS_FEATURED.slice(0, AUTHORS_ALWAYS_SHOWN).map((slug) => (
          <AuthorCard slug={slug} key={slug} />
        ))}

        {showAll &&
          AUTHORS_FEATURED.slice(AUTHORS_ALWAYS_SHOWN).map((slug) => (
            <AuthorCard slug={slug} key={slug} />
          ))}
      </div>

      {!showAll && (
        <div
          className={css({
            mt: 8,
            display: 'flex',
            justifyContent: 'center',
            color: 'textSoft',
          })}
        >
          <Button variant='link' onClick={() => setShowAll(true)} type='button'>
            Mehr anzeigen
          </Button>
        </div>
      )}
    </OnboardingSection>
  )
}

export default AuthorsSection
