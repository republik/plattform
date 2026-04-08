import { css } from '@republik/theme/css'
import { type NewsletterCoursesQuery } from '#graphql/cms/__generated__/gql/graphql'
import Image from 'next/image'

type Credits = NewsletterCoursesQuery['allNewsletterCourses'][number]['credits']

export function Credits({ credits }: { credits: Credits }) {
  if (!credits.length) return null

  const mainContributors = credits.filter((c) => c.mainContributor)
  const secondaryContributors = credits.filter((c) => !c.mainContributor)

  const secondaryByRole = secondaryContributors.reduce<Map<string, Credits>>(
    (map, contributor) => {
      const role = contributor.role ?? ''
      if (!map.has(role)) map.set(role, [])
      map.get(role)!.push(contributor)
      return map
    },
    new Map(),
  )

  return (
    <div>
      {mainContributors.length > 0 && (
        <ul
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
            listStyle: 'none',
            p: '0',
            m: '0',
          })}
        >
          {mainContributors.map((credit, i) => (
            <li
              key={i}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
              })}
            >
              {credit.image?.url && (
                <Image
                  src={credit.image.url}
                  alt={credit.image.alt ?? credit.name ?? ''}
                  width={84}
                  height={84}
                  className={css({
                    borderRadius: 'full',
                    flexShrink: '0',
                    objectFit: 'cover',
                  })}
                />
              )}
              <div>
                {credit.url ? (
                  <a
                    href={credit.url}
                    className={css({
                      fontWeight: 'bold',
                      textDecoration: 'none',
                    })}
                  >
                    {credit.name}
                  </a>
                ) : (
                  <p className={css({ fontWeight: 'bold' })}>{credit.name}</p>
                )}
                {credit.role && (
                  <p className={css({ fontSize: 'base' })}>{credit.role}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {secondaryByRole.size > 0 && (
        <p
          className={css({
            fontSize: 's',
            mt: mainContributors.length ? '4' : '0',
          })}
        >
          {Array.from(secondaryByRole.entries()).map(([role, members], i) => (
            <span key={i}>
              {role && <>{role}: </>}
              {members.map((member, j) => (
                <span key={j}>
                  {member.url ? (
                    <a
                      href={member.url}
                      className={css({ textDecoration: 'underline' })}
                    >
                      {member.name}
                    </a>
                  ) : (
                    member.name
                  )}
                  {j < members.length - 1 && ' und '}
                </span>
              ))}
              {'. '}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
