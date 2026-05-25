'use client'

import FollowContributorCard from '@/app/(sanity)/components/follow/follow-contributor-card'
import type { ArticleContributor } from '@/app/(sanity)/lib/types'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/lib/withT'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { css } from '@republik/theme/css'
import { useState } from 'react'

const CONTRIBUTORS_SHOWN = 3

function ContributorsList({
  contributors,
}: {
  contributors: ArticleContributor[]
}) {
  return (
    <>
      {contributors.map((contributor) => (
        <FollowContributorCard
          key={contributor.slug}
          contributor={contributor}
        />
      ))}
    </>
  )
}

function FollowContributors({
  contributors,
}: {
  contributors: ArticleContributor[]
}) {
  const [showAll, setShowAll] = useState(false)
  const { t } = useTranslation()

  if (!contributors?.length) return null

  const contributorsShown = contributors.slice(0, CONTRIBUTORS_SHOWN)
  const contributorsHidden = contributors.slice(CONTRIBUTORS_SHOWN)

  return (
    <div className={css({ mt: 8, mb: 12, md: { mb: 16 } })}>
      <ContributorsList contributors={contributorsShown} />
      {!!contributorsHidden?.length && (
        <RadixCollapsible.Root open={showAll} onOpenChange={setShowAll}>
          {!showAll && (
            <RadixCollapsible.Trigger asChild>
              <div
                className={css({
                  mt: 8,
                  display: 'flex',
                  color: 'textSoft',
                })}
              >
                <Button
                  variant='link'
                  onClick={() => setShowAll(true)}
                  type='button'
                >
                  {t('follow/authors/all')}
                </Button>
              </div>
            </RadixCollapsible.Trigger>
          )}
          <RadixCollapsible.Content
            data-collapsible-collapsed-items
            className={css({
              overflow: 'hidden',
              animationTimingFunction: 'ease-out',
              animationDuration: '300ms',
              '&[data-state="open"]': {
                animationName: 'radixCollapsibleSlideDown',
              },
              '&[data-state="closed"]:not([hidden])': {
                animationName: 'radixCollapsibleSlideUp',
              },
            })}
          >
            <ContributorsList contributors={contributorsHidden} />
          </RadixCollapsible.Content>
        </RadixCollapsible.Root>
      )}
    </div>
  )
}

export default FollowContributors
