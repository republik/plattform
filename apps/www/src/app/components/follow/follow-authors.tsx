'use client'

import FollowAuthorCard from '@app/components/follow/follow-author-card'
import { Button } from '@app/components/ui/button'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { useTranslation } from '@/lib/withT'

const MAX_AUTHORS = 3

function AuthorsList({ authorIds }: { authorIds: string[] }) {
  {
    return authorIds?.map((authorId) => (
      <FollowAuthorCard key={authorId} authorId={authorId} />
    ))
  }
}

function FollowAuthors({ authorIds }: { authorIds: string[] }) {
  const [showAll, setShowAll] = useState(false)
  const { t } = useTranslation()

  if (authorIds?.length === 0) return null

  const authorsShown = authorIds.slice(0, MAX_AUTHORS)
  const authorsHidden = authorIds.slice(MAX_AUTHORS)

  return (
    <div className={css({ mt: 8, mb: 12, md: { mb: 16 } })}>
      <AuthorsList authorIds={authorsShown} />
      {!!authorsHidden?.length && (
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
            <AuthorsList authorIds={authorsHidden} />
          </RadixCollapsible.Content>
        </RadixCollapsible.Root>
      )}
    </div>
  )
}

export default FollowAuthors
