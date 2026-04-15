import { CMSItemStatus } from '@app/components/cms/item-status'
import { Share } from '@app/components/share/share'
import {
  formatDateShort,
  formatEventDateRange,
  isFutureEvent,
} from '@app/lib/util/time-format'
import { css } from '@republik/theme/css'
import { hstack } from '@republik/theme/patterns'
import { IconCalendar, IconShare } from '@republik/icons'
import { PUBLIC_BASE_URL } from 'lib/constants'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import { StructuredText } from 'react-datocms/structured-text'

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
    _status: string
  }

  isPage?: boolean
  isMember: boolean
}
export const EventTeaser = ({ isMember, event }: EventProps) => {
  const isActive = isFutureEvent(event.startAt, event.endAt)

  return (
    <div
      className={css({
        padding: '6',
        // background: 'challengeAccepted.white',
        borderColor: 'contrast',
        borderStyle: 'solid',
        borderWidth: 1,
        color: 'contrast',
        '& ul > li': {
          listStyleType: 'none',
          pl: '6',
          position: 'relative',
          '&::before': { content: '"–"', position: 'absolute', left: '0' },
        },
        '& ol': { listStyleType: 'decimal', pl: '6' },
        '& h2, & h3, & h4, & h5, & h6': {
          fontWeight: 'bold',
        },
        '& p a': {
          color: 'link',
          textDecoration: 'underline',
        },
      })}
    >
      <div
        className={css({
          pt: '10',
          pb: '16',
        })}
      >
        <p
          className={css({
            textStyle: 'eventTeaserTitle',
            textAlign: 'center',
            // Cap height of font is roughly 1.4 x-height (ex unit)
            lineHeight: '1.2ex',
            // Fix leading
            mb: '0.2ex',
          })}
        >
          {formatDateShort(event.startAt)}
        </p>
      </div>
      <div
        className={css({
          color: 'text',
          display: 'flex',
          flexDirection: 'column',
          gap: '4',

          textStyle: 'teaserLeadSans',
        })}
      >
        <h2 className={css({ textStyle: 'h2Sans', fontWeight: 'bold' })}>
          <Link
            className={css({
              color: 'text',
              textDecoration: 'none',
            })}
            href={`/veranstaltungen/${event.slug}`}
          >
            {event.title} <CMSItemStatus status={event._status} />
          </Link>
        </h2>
        <p className={css({ fontWeight: 700 })}>
          {formatEventDateRange(event.startAt, event.endAt)} / {event.location}
        </p>

        <StructuredText data={event.description.value} />
        {isActive &&
          (event.fullyBooked ? (
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
                    <StructuredText data={event.nonMemberCta.value} />
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
          ))}
        <div className={hstack({ gap: '4', mt: '2' })}>
          <Share
            title={event.title}
            url={`${PUBLIC_BASE_URL}/veranstaltungen/${event.slug}`}
            emailSubject={`Republik: ${event.title}`}
          >
            <div
              className={hstack({
                gap: '2',
                color: 'contrast',
                cursor: 'pointer',
                fontWeight: 'medium',
                fontSize: 's',
                textDecoration: 'none',
              })}
            >
              <IconShare size={20} /> Teilen
            </div>
          </Share>

          <Link
            className={hstack({
              gap: '2',
              color: 'contrast',
              cursor: 'pointer',
              fontWeight: 'medium',
              fontSize: 's',
              textDecoration: 'none',
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
