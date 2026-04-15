import { css } from '@republik/theme/css'
import { type NewsletterCourseQuery } from '#graphql/cms/__generated__/gql/graphql'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@app/components/ui/accordion'

type EntriesProps = {
  slug: string
  entries: NonNullable<NewsletterCourseQuery['newsletterCourse']>['entries']
}

export function Entries({ slug, entries }: EntriesProps) {
  if (entries.length === 0) return null

  return (
    <Accordion name={`course-entries-${slug}`}>
      {entries.map((entry, i) => (
        <AccordionItem key={i}>
          <AccordionTrigger>
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '1',
              })}
            >
              <span
                className={css({
                  alignSelf: 'start',
                  bg: 'overlaySubtle',
                  py: '1',
                  px: '3',
                  borderRadius: 'full',
                  lineHeight: '1',
                  fontSize: 'xs',
                  textStyle: 'sansSerifMedium',
                })}
              >
                {i + 1}. Woche
              </span>
              <span
                className={css({
                  textStyle: 'sansSerifMedium',
                  fontSize: 'xl',
                })}
              >
                {entry.title}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p
              className={css({ textStyle: 'sansSerifRegular', fontSize: 'l' })}
            >
              {entry.description}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
