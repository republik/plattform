import { NewsletterSubscribeButton } from '@/app/(sanity)/components/newsletters/newsletter-subscribe'
import { Button } from '@/app/components/ui/button'
import type { PAGE_CONTENT_QUERY_RESULT } from '@/sanity.types'
import { css } from '@republik/theme/css'

type PageBuilderBlock = NonNullable<
  NonNullable<PAGE_CONTENT_QUERY_RESULT>['pageBuilder']
>[number]

export type CallToActionBlock = Extract<
  PageBuilderBlock,
  { _type: 'callToAction' }
>

/** GROQ projection for the `callToAction` block, resolving its `target`. */
export const callToActionFragment = /* groq */ `
  _type == "callToAction" => {
    target->{
      _id,
      _type,
      _type == "newsletter" => {
        title,
        description,
        frequency,
        image,
        name
      },
      _type == "podcast" => {
        title
      },
      _type == "articleCollection" => {
        title,
        description
      }
    }
  }
`

/**
 * A call-to-action box for a newsletter, podcast or article collection.
 * Newsletter targets render an inline subscribe form; other targets render a
 * generic button labelled with `ctaText`.
 */
export function CallToAction({ block }: { block: CallToActionBlock }) {
  const { target } = block
  if (!target) {
    return null
  }

  const heading = block.title || target.title
  const description = 'description' in target ? target.description : null

  return (
    <div
      className={css({
        my: 6,
        p: 6,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: block.useAccentColor
          ? 'var(--page-theme-accent-color)'
          : 'divider',
        borderRadius: 4,
      })}
    >
      {heading && (
        <h3 className={css({ textStyle: 'sansSerifMedium', fontSize: 'l' })}>
          {heading}
        </h3>
      )}
      {description && (
        <p className={css({ textStyle: 'serif', fontSize: 'm', mt: 2 })}>
          {description}
        </p>
      )}
      <div className={css({ mt: 4 })}>
        {target._type === 'newsletter' ? (
          <NewsletterSubscribeButton newsletter={target} />
        ) : (
          // TODO: wire up link target for podcast / collection CTAs
          <Button asChild>
            <a href='#'>{block.ctaText}</a>
          </Button>
        )}
      </div>
    </div>
  )
}
