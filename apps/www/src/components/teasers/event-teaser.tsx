import { css } from '@app/styled-system/css'
import { timeFormat, isoParse } from 'd3-time-format'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import { StructuredText } from 'react-datocms'

const formatDate = timeFormat('%d.%m.%y')
const formateTime = timeFormat('%H:%M')

type EventProps = {
  event: {
    title: string
    description?: {
      value: ComponentPropsWithoutRef<typeof StructuredText>['data']
    }
    isPublic?: boolean
    nonMemberCta?: {
      value: ComponentPropsWithoutRef<typeof StructuredText>['data']
    }
    location: string
    startAt: string
    endAt?: string
    signUpLink?: string
    fullyBooked?: boolean
  }
  isMember: boolean
}

export const EventTeaser = ({ event, isMember }: EventProps) => {
  return (
    <div
      className={css({
        padding: '6',
        // background: 'challengeAccepted.white',
        borderColor: 'contrast',
        borderStyle: 'solid',
        borderWidth: 1,
        color: 'contrast',
      })}
    >
      <h3
        className={css({
          textStyle: 'eventTeaserTitle',
          textAlign: 'center',
          mb: '6',
        })}
      >
        {formatDate(isoParse(event.startAt))}
      </h3>
      <div
        className={css({
          color: 'text',
          display: 'flex',
          flexDirection: 'column',
          gap: '4',
        })}
      >
        <h4 className={css({ textStyle: 'h2Sans' })}>
          {event.title} {event.fullyBooked && '(ausgebucht)'}
        </h4>
        <p className={css({})}>
          {formateTime(isoParse(event.startAt))} -{' '}
          {event.endAt ? formateTime(isoParse(event.endAt)) : 'offen'} /{' '}
          {event.location}
        </p>
        <StructuredText data={event.description.value} />
        {!event.fullyBooked && (
          <>
            {!isMember && !event.isPublic ? (
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
