import type { Metadata, ResolvingMetadata } from 'next'
import React from 'react'

import { NewsletterCoursesDocument } from '#graphql/cms/__generated__/gql/graphql'
import { ContainerNarrow } from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { type NewsletterName } from '@app/components/newsletters/config'
import { NewsletterSubscribeButton } from '@app/components/newsletters/newsletter-subscribe'
import { getCMSClientBase } from '@app/lib/apollo/cms-client-base'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { css } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import { notFound } from 'next/navigation'
import { Credits } from '../components/credits'
import { Entries } from '../components/entries'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import Link from 'next/link'
import { Testimonials } from '../components/testimonials'
import { Share } from '@app/components/share/share'
import Image from 'next/image'
import { cx } from '@republik/theme/css'

type PageProps = {
  params: Promise<{ slug: string }>
}

const courseQueryOptions = {
  query: NewsletterCoursesDocument,
  context: {
    fetchOptions: {
      next: { tags: ['newsletter-courses'] },
    },
  },
}

export async function generateStaticParams() {
  const client = getCMSClientBase({ draftMode: false })
  const { data } = await client.query(courseQueryOptions)
  return data.allNewsletterCourses.map((course) => ({
    slug: course.slug,
  }))
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params
  const client = await getCMSClient()
  const { data } = await client.query(courseQueryOptions)
  const course = data.allNewsletterCourses.find((c) => c.slug === slug)

  if (!course) return (await parent) as Metadata

  return {
    title: course.title,
    description: course.promise,
    openGraph: {
      title: course.title,
      description: course.promise,
      images: [course.images[0].url],
    },
  }
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params
  const client = await getCMSClient()
  const { data } = await client.query(courseQueryOptions)
  const course = data.allNewsletterCourses.find((c) => c.slug === slug)

  if (!course) notFound()

  const {
    title,
    promise,
    content,
    credits,
    images,
    heroBackgroundColor,
    heroTextColor,
    accentColor,
    accentTextColor,
    entries,
    testimonials,
    newsletterId,
    numberOfParticipants,
    reasons,
  } = course

  return (
    <EventTrackingContext category='CoursePage'>
      <PageLayout>
        <section
          style={{
            backgroundColor: heroBackgroundColor.hex,
            color: heroTextColor.hex,
          }}
          className={css({
            height: 'calc(100dvh - token(sizes.header.height))',
            display: 'flex',
            flexDirection: 'column',
            md: {
              height: 'auto',
              py: '12',
              gap: '8',
            },
          })}
        >
          {/* First image is the hero image */}
          {images[0].width && images[0].height && (
            <div
              style={
                {
                  '--image-ar': `${images[0].width}/${images[0].height}`,
                } as React.CSSProperties
              }
              className={css({
                flex: '1',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '0',
                md: {
                  flex: 'none',
                  width: 'full',
                  maxWidth: 'content.narrow',
                  mx: 'auto',
                  aspectRatio: 'var(--image-ar)',
                },
              })}
            >
              <Image
                src={images[0].url}
                fill
                alt={images[0].alt ?? title}
                className={css({
                  objectFit: 'cover',
                  objectPosition: 'center',
                })}
              />
            </div>
          )}
          <ContainerNarrow>
            <div
              className={css({
                py: '6',
                display: 'flex',
                flexDirection: 'column',
                gap: '6',
              })}
            >
              <div>
                <h1
                  className={css({
                    textStyle: 'title',
                    lineHeight: 'normal',
                    fontSize: '3xl',
                    mb: '2',
                  })}
                >
                  {title}
                </h1>
                <p
                  className={css({
                    textStyle: 'sans',
                    fontSize: 'l',
                  })}
                >
                  {promise}
                </p>
              </div>
              <NewsletterSubscribeButton
                newsletter={newsletterId as NewsletterName}
                accentColor={accentColor?.hex ?? undefined}
                accentTextColor={accentTextColor?.hex ?? undefined}
                course={true}
              />
              <p className={css({ textAlign: 'center' })}>
                Abmeldung jederzeit möglich.
              </p>
            </div>
          </ContainerNarrow>
        </section>

        <section
          className={css({
            pb: '20',
            bg: 'background.marketing',
          })}
        >
          <ContainerNarrow>
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '16',
                pt: '8',
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6',
                })}
              >
                <p
                  className={css({
                    textStyle: 'sans',
                    fontSize: 'l',
                  })}
                >
                  Schon mehr als{' '}
                  <span className={css({ textStyle: 'sansSerifMedium' })}>
                    {numberOfParticipants}
                  </span>{' '}
                  Menschen haben den Kurs gemacht. Das sagen sie:
                </p>
                <Testimonials testimonials={testimonials} />
              </div>
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2',
                })}
              >
                <h2
                  className={css({
                    textStyle: 'sans',
                    fontSize: 'l',
                    fontWeight: 'bold',
                  })}
                >
                  Inhalt
                </h2>
                <p
                  className={css({
                    textStyle: 'sans',
                    fontSize: 'l',
                  })}
                >
                  {/* Since we allow bold decoration in the content, we need to split 
                  the content into parts and wrap the bold parts in <b> tags */}
                  {content.split(/\*\*(.+?)\*\*/).map((part, i) =>
                    i % 2 === 0 ? (
                      part
                    ) : (
                      <span
                        className={css({ textStyle: 'sansSerifMedium' })}
                        key={i}
                      >
                        {part}
                      </span>
                    ),
                  )}
                </p>
              </div>
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2',
                })}
              >
                <h2
                  className={css({
                    textStyle: 'sans',
                    fontSize: 'l',
                    fontWeight: 'bold',
                  })}
                >
                  Kapitel
                </h2>
                <Entries slug={slug} entries={entries} />
              </div>

              <div
                className={css({
                  bg: 'white',
                  p: '6',
                })}
              >
                <h2
                  className={css({
                    textStyle: 'sans',
                    fontWeight: 'medium',
                    fontSize: 'xl',
                    mb: '2',
                  })}
                >
                  Dieser Kurs ist genau das Richtige für Sie, wenn...
                </h2>
                <ul>
                  {reasons.map((reason) => (
                    <li
                      className={css({
                        listStyleType: 'disc',
                        listStylePosition: 'inside',
                        pl: '4',
                        mb: '3',
                        '&:last-child': {
                          mb: '0',
                        },
                      })}
                      key={reason.testimonial}
                    >
                      {reason.testimonial}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2',
                })}
              >
                <h2
                  className={css({
                    textStyle: 'sans',
                    fontSize: 'l',
                    fontWeight: 'bold',
                  })}
                >
                  Durch den Kurs führen Sie
                </h2>
                <Credits credits={credits} />

                <Share
                  title={title}
                  url={`${process.env.NEXT_PUBLIC_CDN_FRONTEND_BASE_URL}/kurse/${slug}`}
                  emailSubject={title}
                >
                  <div
                    className={cx(
                      button({
                        variant: 'outline',
                        size: 'full',
                      }),
                      css({ mt: '4' }),
                    )}
                  >
                    Kurs teilen
                  </div>
                </Share>
              </div>

              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6',
                  bg: 'rgba(0, 0, 0, 0.1)',
                  p: '6',
                })}
              >
                <h1
                  className={css({
                    textStyle: 'title',
                    fontWeight: 'bold',
                    fontSize: '3xl',
                  })}
                >
                  {title}
                </h1>
                <NewsletterSubscribeButton
                  newsletter={newsletterId as NewsletterName}
                  course={true}
                />
                <p className={css({ textAlign: 'center' })}>
                  Abmeldung jederzeit möglich.
                </p>
              </div>

              <p>
                Mit Ihrer Anmeldung stimmen Sie den{' '}
                <Link
                  href='/datenschutz'
                  className={button({ variant: 'link' })}
                >
                  Datenschutzbestimmungen
                </Link>{' '}
                der Republik zu und erlauben uns, Sie nach Ablauf des Kurses
                über Angebote der Republik zu informieren. Abmeldung jederzeit
                möglich.
              </p>
            </div>
          </ContainerNarrow>
        </section>
      </PageLayout>
    </EventTrackingContext>
  )
}
