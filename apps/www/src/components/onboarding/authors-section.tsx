'use client'

import {
  FollowableAuthorDocument,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { FollowButton } from '@app/components/follow/follow-button'
import { Section, SectionH3 } from '@app/components/ui/section'
import { css } from '@republik/theme/css'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'
import { Button } from '../ui/button'
import { AUTHORS_FEATURED, AuthorType } from './config'

function AuthorCard({
  author,
  showAll,
}: {
  author: AuthorType
  showAll: boolean
}) {
  const { t } = useTranslation()
  const { data } = useQuery(FollowableAuthorDocument, {
    variables: { id: author.id },
  })

  const authorData = data?.user

  if (!authorData) return null

  const subscriptionId = authorData.subscribedBy.nodes.find((n) => n.active)?.id

  return (
    <div
      className={`${css({
        display: 'none',
        alignItems: 'center',
        gap: 2,
        md: {
          maxWidth: '350px',
        },
      })} author-card ${showAll ? 'show-author-card' : ''}`}
    >
      <Image
        width='84'
        height='84'
        className={css({
          borderRadius: '96px',
          backgroundColor: 'divider',
        })}
        src={authorData.portrait}
        alt=''
      />
      <div>
        <h4 className={css({ fontWeight: 'bold' })}>{authorData.name}</h4>
        <p className={css({ color: 'textSoft' })}>
          {t(`onboarding/authors/${author.slug}/beat`)}
        </p>
        <div
          className={css({
            display: 'none',
            md: { display: 'block', mt: 2 },
          })}
        >
          <FollowButton
            type={SubscriptionObjectType.User}
            subscriptionId={subscriptionId}
            objectId={author.id}
            objectName={authorData.name}
          />
        </div>
      </div>
      <div className={css({ ml: 'auto', md: { display: 'none' } })}>
        <FollowButton
          type={SubscriptionObjectType.User}
          subscriptionId={subscriptionId}
          objectId={author.id}
          objectName={authorData.name}
        />
      </div>
    </div>
  )
}

function AuthorsSection() {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  return (
    <Section>
      <SectionH3>{t('onboarding/authors/title')}</SectionH3>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          // CSS solution to show only first 3 authors on mobile and
          // first 6 on desktop and allow to expand to all authors
          // on all devices
          '& .author-card:nth-child(-n + 3)': {
            display: 'flex',
          },
          '& .author-card.show-author-card': {
            display: 'flex',
          },
          md: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            rowGap: 12,
            '& .author-card:nth-child(-n + 6)': {
              display: 'flex',
            },
          },
        })}
      >
        {AUTHORS_FEATURED.map((author) => (
          <AuthorCard author={author} key={author.slug} showAll={showAll} />
        ))}
      </div>

      <div
        className={css({
          mt: 8,
          display: 'flex',
          justifyContent: 'center',
          color: 'textSoft',
        })}
      >
        <Button
          variant='link'
          onClick={() => setShowAll(!showAll)}
          type='button'
        >
          {t(`onboarding/authors/${showAll ? 'less' : 'more'}`)}
        </Button>
      </div>
    </Section>
  )
}

export default AuthorsSection
