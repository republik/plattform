'use client'
import { Share } from '@app/components/share/share'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { css } from '@app/styled-system/css'
import { hstack, vstack } from '@app/styled-system/patterns'
import { IconCalendar, IconShare } from '@republik/icons'
import { isoParse } from 'd3-time-format'
import { swissTime } from 'lib/utils/format'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import { StructuredText } from 'react-datocms'

const formatDateTime = swissTime.format('%A, %d.%m.%Y, %H.%M')
const formateTime = swissTime.format('%H.%M')

type EventProps = {
  event: {
    title: string
    slug: string
    description?: {
      value: ComponentPropsWithoutRef<typeof StructuredText>['data']
    }
    membersOnly?: boolean
    nonMemberCta?: {
      value: ComponentPropsWithoutRef<typeof StructuredText>['data']
    }
    location: string
    locationLink?: string
    startAt: string
    endAt?: string
    signUpLink?: string
    fullyBooked?: boolean
    _updatedAt: string
  }
  isPage?: boolean
  isMember: boolean
}

export const EventTeaser = ({ isPage, isMember, event }: EventProps) => {
  const { isNativeApp } = usePlatformInformation()

  return (
    <div
      className={css({
        py: '6',
        borderColor: 'divider',
        borderBottomWidth: 1,
        color: 'text',
        '& ul > li': {
          listStyleType: 'none',
          pl: '6',
          position: 'relative',
          '&::before': { content: '"–"', position: 'absolute', left: '0' },
        },
        '& ol': { listStyleType: 'decimal', pl: '6' },
        '& h3, & h4, & h5, & h6': {
          fontWeight: 'medium',
        },
        '& a': {
          color: 'text',
          _hover: { color: 'textSoft' },
        },
      })}
    >
      <div
        className={css({
          color: 'text',
          display: 'flex',
          flexDirection: 'column',
          gap: '4',

          textStyle: 'teaserLeadSans',
        })}
      >
        {isPage ? (
          <h1
            className={css({
              textStyle: 'h1Sans',
              fontSize: { base: '3xl', md: '4xl' },
              mt: '-0.1lh',
            })}
          >
            {event.title}
          </h1>
        ) : (
          <h2
            className={css({
              textStyle: 'h1Sans',
              fontSize: { base: '3xl', md: '4xl' },
              mt: '-0.1lh',
              '& a': { textDecoration: 'none' },
            })}
          >
            <Link href={`/veranstaltungen/${event.slug}`}>{event.title}</Link>
          </h2>
        )}

        <dl
          className={css({
            display: 'grid',
            gap: '2',
            gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',

            '& dt': {
              fontSize: 's',
              color: 'textSoft',
            },
            '& dd': {
              fontWeight: 'medium',
            },
          })}
        >
          <div>
            <dt>Wann</dt>
            <dd>
              {formatDateTime(isoParse(event.startAt))}
              {event.endAt
                ? `–${formateTime(isoParse(event.endAt))} Uhr`
                : ' Uhr'}
            </dd>
          </div>
          <div>
            <dt>Wo</dt>
            <dd>
              {event.locationLink ? (
                <Link href={event.locationLink} rel='noreferrer'>
                  {event.location}
                </Link>
              ) : (
                event.location
              )}
            </dd>
          </div>
        </dl>

        <StructuredText data={event.description.value} />
        {event.fullyBooked ? (
          <p
            className={css({
              fontStyle: 'italic',
            })}
          >
            Die Veranstaltung ist ausgebucht.
          </p>
        ) : (
          <>
            {event.membersOnly && !isMember ? (
              <>
                {event.nonMemberCta && (
                  <div
                    className={vstack({
                      gap: '4',
                      alignItems: 'flex-start',
                      fontStyle: 'italic',
                    })}
                  >
                    <StructuredText data={event.nonMemberCta.value} />
                  </div>
                )}
              </>
            ) : (
              <>
                {event.signUpLink && (
                  <Link target='_blank' href={event.signUpLink}>
                    Zur Anmeldung
                  </Link>
                )}
              </>
            )}
          </>
        )}
        <div className={hstack({ gap: '4', mt: '2' })}>
          <Share
            title={event.title}
            url={`${process.env.NEXT_PUBLIC_BASE_URL}/veranstaltungen/${event.slug}`}
            emailSubject={`Republik: ${event.title}`}
          >
            <div
              className={hstack({
                gap: '2',
                color: 'text',
                cursor: 'pointer',
                fontWeight: 'medium',
                fontSize: 's',
                textDecoration: 'none',
                _hover: {
                  color: 'textSoft',
                },
              })}
            >
              <IconShare size={20} /> Teilen
            </div>
          </Share>

          <Link
            className={hstack({
              gap: '2',
              color: 'text',
              cursor: 'pointer',
              fontWeight: 'medium',
              fontSize: 's',
              textDecoration: 'none',
              _hover: {
                color: 'textSoft',
              },
            })}
            // Link to the calendar file via CDN because the app can't handle downloads. This way, the file will be opened in the OS browser.
            // To bust the CDN cache, ?v= is added with the timestamp when the event record was updated.
            href={`${
              process.env.NEXT_PUBLIC_CDN_FRONTEND_BASE_URL
            }/veranstaltungen/${event.slug}/ics?v=${encodeURIComponent(
              event._updatedAt,
            )}`}
          >
            <IconCalendar size={20} /> Zum Kalender hinzufügen
          </Link>
        </div>
      </div>
    </div>
  )
}
