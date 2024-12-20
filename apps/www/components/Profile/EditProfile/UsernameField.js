import { Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { withApollo } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import withT from '../../../lib/withT'
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

const query = gql`
  query checkUsername($value: String) {
    checkUsername(username: $value)
  }
`

class UsernameField extends Component {
  check() {
    const { client, values, onChange } = this.props
    if (!values.username) {
      return
    }
    client
      .query({
        query,
        variables: {
          value: values.username,
        },
      })
      .then(({ data }) => {
        onChange({
          errors: {
            username: undefined,
          },
        })
      })
      .catch((error) => {
        onChange({
          errors: {
            username: errorToString(error),
          },
        })
      })
  }
  UNSAFE_componentWillMount() {
    const { values } = this.props
    if (values.username) {
      this.check()
    } else {
      const { onChange, user } = this.props
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
  }
  componentDidUpdate(prevProps) {
    if (prevProps.values.username !== this.props.values.username) {
      this.check()
    }
  }
  render() {
    const { t, onChange, values, errors } = this.props

    return (
      <Fragment>
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
      </Fragment>
    )
  }
}

// TMP: Waiting for fix:
// - https://github.com/apollographql/apollo-client/issues/2703
// - once ready: rm class and replace with graphql connected function

export default compose(withT, withApollo)(UsernameField)
