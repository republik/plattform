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

const formatNames = (names: string[]): string => {
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} und ${names[1]}`
  return `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}`
}

const ExtendedByline = ({ contributors }: { contributors?: Contributor[] }) => {
  if (!contributors || contributors.length === 0) {
    return null
  }
  // restructure the byline to be grouped by role
  const extendedBylineByRoles = contributors.reduce((acc, item) => {
    if (!acc[item.role]) {
      acc[item.role] = []
    }
    acc[item.role].push(item.author)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <Center>
      <h3>Diese Beitrag wurde</h3>
      {Object.entries(extendedBylineByRoles).map(([role, names]) => (
        <div key={role}>
          <Editorial.Credit>
            <b>{roleStrings[role as keyof typeof roleStrings]}</b>
            {': '}
            <span>{formatNames(names)}</span>
          </Editorial.Credit>
        </div>
      ))}
    </Center>
  )
}

export default ExtendedByline
