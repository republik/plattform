import { css } from '@republik/theme/css'
import { type NewsletterCourseQuery } from '#graphql/cms/__generated__/gql/graphql'

export function Testimonials({
  testimonials,
}: {
  testimonials: NonNullable<NewsletterCourseQuery['newsletterCourse']>['testimonials']
}) {
  if (testimonials.length === 0) return null

  return (
    <div
      className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}
    >
      {testimonials.map((testimonial, i) => (
        <div
          key={i}
          className={css({
            width: '2/3',
            alignSelf: 'flex-start',
            '&:nth-child(even)': { alignSelf: 'flex-end' },
            bg: 'background.marketingSurface',
            p: '4',
            borderRadius: 'sm',
          })}
        >
          <p>{testimonial.testimonial}</p>
        </div>
      ))}
    </div>
  )
}
