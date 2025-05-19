import React from 'react'
import { Center, Editorial } from '@project-r/styleguide'

const defaultBylineContributors = [
  {
    name: 'Olivier Baumann',
    role: 'text',
  },
  {
    name: 'Anna Trausnig',
    role: 'text',
  },
  {
    name: 'Siliva Schiaulini',
    role: 'illustration',
  },
  {
    name: 'Luciana Kolbeck',
    role: 'factChecking',
  },
  {
    name: 'Jeremy Stucki',
    role: 'korrektorat',
  },
  {
    name: 'Henning Dahlheim',
    role: 'production',
  },
]

const roleStrings = {
  text: 'Text',
  illustration: 'Illustration',
  factChecking: 'Fact-Checking',
  korrektorat: 'Korrektorat',
  production: 'Produktion',
}

const formatNames = (names: string[]): React.ReactElement => {
  if (names.length === 1) return <b>{names[0]}</b>
  if (names.length === 2)
    return (
      <>
        <b>{`${names[0]}`}</b> und <b>{`${names[1]}`}</b>
      </>
    )
  return (
    <>
      <b>{`${names.slice(0, -1).join(', ')}`}</b> und{' '}
      <b>{`${names[names.length - 1]}`}</b>
    </>
  )
}

const ExtendedByline = ({
  bylineContributors = defaultBylineContributors,
}: {
  bylineContributors: typeof defaultBylineContributors
}) => {
  // restructure the byline to be grouped by role
  const extendedBylineByRoles = bylineContributors.reduce((acc, item) => {
    if (!acc[item.role]) {
      acc[item.role] = []
    }
    acc[item.role].push(item.name)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <Center>
      <Editorial.Credit>Mitwirkende</Editorial.Credit>
      {Object.entries(extendedBylineByRoles).map(([role, names]) => (
        <div key={role}>
          <Editorial.Credit>
            <span style={{ marginRight: '0.5rem' }}>
              {roleStrings[role as keyof typeof roleStrings]}
            </span>
            <span>{formatNames(names)}</span>
          </Editorial.Credit>
        </div>
      ))}
    </Center>
  )
}

export default ExtendedByline
