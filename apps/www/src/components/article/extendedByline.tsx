import React, { useState } from 'react'
import { Center, Editorial, plainButtonRule } from '@project-r/styleguide'

type Contributor = {
  author: string
  role: string
  main?: boolean
}

const roleStrings = {
  writing: 'Text',
  editing: 'Redigatur',
  'fact-checking': 'Faktencheck',
  proofreading: 'Korrektur',
  translation: 'Übersetzung',
  pictures: 'Bilder',
  illustration: 'Illustrationen',
  'visual editing': 'Visuelles Editing',
  'data visulalization': 'Datenvisualizierung',
  'voice over': 'Gelesen von',
  'audio editing': 'Audioediting',
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
  bylineContributors,
}: {
  bylineContributors?: Contributor[]
}) => {
  const [showAll, setShowAll] = useState(false)

  if (!bylineContributors || bylineContributors.length === 0) {
    return null
  }
  // restructure the byline to be grouped by role
  const extendedBylineByRoles = bylineContributors.reduce((acc, item) => {
    if (!acc[item.role]) {
      acc[item.role] = []
    }
    acc[item.role].push(item.author)
    return acc
  }, {} as Record<string, string[]>)

  const entries = Object.entries(extendedBylineByRoles)
  const hasMoreThanThree = entries.length > 3
  const displayEntries = showAll ? entries : entries.slice(0, 3)

  return (
    <Center>
      <Editorial.Credit>Mitwirkende</Editorial.Credit>
      {displayEntries.map(([role, names]) => (
        <div key={role}>
          <Editorial.Credit>
            <span style={{ marginRight: '0.5rem' }}>
              {roleStrings[role as keyof typeof roleStrings]}
            </span>
            <span>{formatNames(names)}</span>
          </Editorial.Credit>
        </div>
      ))}
      {hasMoreThanThree && !showAll && (
        <button
          {...plainButtonRule}
          style={{ textDecoration: 'underline' }}
          onClick={() => setShowAll(true)}
        >
          <Editorial.Credit>Alle anzeigen</Editorial.Credit>
        </button>
      )}
    </Center>
  )
}

export default ExtendedByline
