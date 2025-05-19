import React from 'react'
import { Center, Editorial } from '@project-r/styleguide'

type Contributor = {
  author: string
  role: string
  main?: boolean
}

const roleStrings = {
  writing: 'Text',
  editing: 'editing',
  'fact-checking': 'fact-checking',
  proofreading: 'proofreading',
  translation: 'translation',
  pictures: 'pictures',
  illustration: 'illustration',
  'visual editing': 'visual editing',
  'data visulalization': 'data visulalization',
  'voice over': 'voice over',
  'audio editing': 'audio editing',
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
