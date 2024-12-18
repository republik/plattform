import { useEffect } from 'react'
import { gql, useQuery } from '@apollo/client'
import { errorToString } from '../../../lib/utils/errors'

import { Field, Label } from '@project-r/styleguide'

const diacritics = [
  { base: 'a', letters: ['ä', 'â', 'à'] },
  { base: 'c', letters: ['ç'] },
  { base: 'e', letters: ['é', 'ê', 'è', 'ë'] },
  { base: 'i', letters: ['î', 'ï'] },
  { base: 'o', letters: ['ö', 'ô'] },
  { base: 'u', letters: ['ü', 'ù', 'û'] },
  { base: 'ss', letters: ['ß'] },
]

const diacriticsMap = diacritics.reduce((map, diacritic) => {
  diacritic.letters.forEach((letter) => {
    map[letter] = diacritic.base
  })
  return map
}, {})

const toUsername = (string) =>
  string
    .toLowerCase() // eslint-disable-next-line no-control-regex
    .replace(/[^\u0000-\u007E]/g, (a) => diacriticsMap[a] || a)
    .replace(/[^.0-9a-z]+/g, ' ')
    .trim()
    .replace(/\s+/g, '.')

const checkUserNameQuery = gql`
  query checkUsername($value: String) {
    checkUsername(username: $value)
  }
`

const UsernameField = ({ values, user, errors, onChange, t }) => {
  const { loading, error } = useQuery(checkUserNameQuery, {
    variables: { value: values.username },
    skip: !values.username,
  })

  if (!values.username) {
    const username = toUsername(
      [user.firstName && user.firstName[0], user.lastName]
        .filter(Boolean)
        .join(''),
    )
    if (username) {
      onChange({
        values: {
          username: username,
        },
      })
    }
  }

  useEffect(() => {
    if (!loading) {
      onChange({
        errors: {
          username: error ? errorToString(error) : undefined,
        },
      })
    }
  }, [loading, error])

  return (
    <>
      <Field
        label={t('profile/username/label')}
        error={errors.username}
        value={values.username}
        onChange={(_, value) => {
          onChange({
            values: {
              username: value ? toUsername(value) : null,
            },
          })
        }}
      />
      <Label style={{ display: 'block', marginTop: -10, marginBottom: 10 }}>
        {t('profile/username/note')}
      </Label>
    </>
  )
}

export default UsernameField
