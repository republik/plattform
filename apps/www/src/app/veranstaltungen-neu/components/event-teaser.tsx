import { css } from '@app/styled-system/css'
import { vstack } from '@app/styled-system/patterns'
import { isoParse } from 'd3-time-format'
import { swissTime } from 'lib/utils/format'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import { StructuredText } from 'react-datocms'

// export const swissTime = timeFormatLocale(timeDefinition)

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

export const EventTeaser = ({ event, isPage, isMember }: EventProps) => {
  return (
    <div
      className={css({
        py: '12',
        // background: 'challengeAccepted.white',
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
              mt: '-0.2lh',
            })}
          >
            {event.title}
          </h1>
        ) : (
          <h2
            className={css({
              textStyle: 'h1Sans',
              fontSize: { base: '3xl', md: '4xl' },
              mt: '-0.2lh',
              '& a': { textDecoration: 'none' },
            })}
          >
            <Link href={`/veranstaltungen-neu/${event.slug}`}>
              {event.title}
            </Link>
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
                <Link href={event.locationLink} rel='noopener noreferrer'>
                  {event.location}
                </Link>
              ) : (
                event.location
              )}
            </dd>
          </div>
        </dl>
        {/* <p className={css({ fontSize: 'xl', fontWeight: 'medium' })}>
          
        </p>
        <p className={css({ fontSize: 'xl', fontWeight: 'medium' })}>
          {event.location}
        </p> */}

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
      </div>
    </div>
  )
}
