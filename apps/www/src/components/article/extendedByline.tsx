import { Center, Editorial } from '@project-r/styleguide'

const defaultByline = [
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

const formatNames = (names: string[]): string => {
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} und ${names[1]}`
  return `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}`
}

const ExtendedByline = ({
  extendedByline = defaultByline,
}: {
  extendedByline: typeof defaultByline
}) => {
  // restructure the byline to be grouped by role
  const extendedBylineByRoles = extendedByline.reduce((acc, item) => {
    if (!acc[item.role]) {
      acc[item.role] = []
    }
    acc[item.role].push(item.name)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <Center>
        <h3>Diese Beitrag wurde</h3>
        {Object.entries(extendedBylineByRoles).map(([role, names]) => (
          <div key={role}>
            <Editorial.Credit>
              <b>{roleStrings[role as keyof typeof roleStrings]}</b>{': '}
              <span>{formatNames(names)}</span>
            </Editorial.Credit>
          </div>
        ))}
    </Center>
  )
}

export default ExtendedByline
