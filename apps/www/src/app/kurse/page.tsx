import { NewsletterCoursesDocument } from '#graphql/cms/__generated__/gql/graphql'
import type { Metadata, ResolvingMetadata } from 'next'
import { PageLayout } from '@/app/components/layout'
import { getCMSClient } from '@/app/lib/apollo/cms-client'
import { css } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Image from 'next/image'
import Link from 'next/link'

const courseQueryOptions = {
  query: NewsletterCoursesDocument,
  context: {
    fetchOptions: {
      next: { tags: ['newsletter-courses'] },
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Republik Newsletter Kurse',
    description: 'Kostenlose Online-Kurse von Republik',
    openGraph: {
      title: 'Republik Newsletter Kurse',
      description: 'Kostenlose Online-Kurse von Republik',
      images: ['/static/social-media/teilen.png'],
    },
  }
}

export default async function KursePage() {
  const client = await getCMSClient()
  const { data } = await client.query(courseQueryOptions)
  const courses = data.allNewsletterCourses

  return (
    <PageLayout>
      <div className={css({ display: 'flex', flexDirection: 'column' })}>
        {courses.map((course) => {
          const image = course.images[0]
          return (
            <div
              key={course.slug}
              style={{
                backgroundColor: course.heroBackgroundColor.hex,
                color: course.heroTextColor.hex,
              }}
            >
              <div
                className={css({
                  mx: 'auto',
                  maxWidth: 'maxContentWidth',
                  display: 'flex',
                  flexDirection: 'column',
                  py: '10',
                  gap: '6',
                  md: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    py: '20',
                    gap: '10',
                    px: '12',
                  },
                })}
              >
                {image?.url && image?.width && image?.height && (
                  <div
                    className={css({
                      px: '6',
                      md: { px: '0', width: '1/2', flexShrink: '0' },
                    })}
                  >
                    <Image
                      src={image.url}
                      width={image.width}
                      height={image.height}
                      alt={image.alt ?? course.title}
                      className={css({ width: 'full', height: 'auto' })}
                    />
                  </div>
                )}
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4',
                    px: '6',
                    md: { px: '0' },
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2',
                    })}
                  >
                    <h2
                      className={css({
                        textStyle: 'title',
                        fontSize: '2xl',
                        lineHeight: 'normal',
                      })}
                    >
                      {course.title}
                    </h2>
                    <p className={css({ textStyle: 'sans', fontSize: 'l' })}>
                      {course.promise}
                    </p>
                  </div>
                  <div>
                    <Link
                      href={`/kurse/${course.slug}`}
                      style={{
                        backgroundColor: course.accentColor?.hex ?? undefined,
                        color: course.accentTextColor?.hex ?? undefined,
                      }}
                      className={button({
                        variant: 'default',
                        size: 'default',
                      })}
                    >
                      Zum Kurs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}
