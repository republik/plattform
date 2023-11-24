import { css } from '@app/styled-system/css'
import { isoParse } from 'd3-time-format'
import { swissTime } from 'lib/utils/format'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import { StructuredText } from 'react-datocms'

const formatDate = swissTime.format('%d.%m.%y')
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
  }

  isPage?: boolean
  isMember: boolean
}
export const EventTeaser = ({ isMember, event }: EventProps) => {
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
          {formatDate(isoParse(event.startAt))}
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
            {event.title}
          </Link>
        </h2>
        <p className={css({ fontWeight: 700 })}>
          {formatDateTime(isoParse(event.startAt))}
          {event.endAt
            ? `–${formateTime(isoParse(event.endAt))} Uhr `
            : ' Uhr '}
          / {event.location}
        </p>

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
        )}
      </div>
    </div>
  )
}
