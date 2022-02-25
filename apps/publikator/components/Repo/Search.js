import React, { useState, useEffect } from 'react'
import { compose } from 'react-apollo'
import withT from '../../lib/withT'
import { Router } from '../../lib/routes'
import { Field, useDebounce } from '@project-r/styleguide'
import { withRouter } from 'next/router'

export const SEARCH_MIN_LENGTH = 3

const DebouncedSearch = compose(
  withT,
  withRouter,
)(
  ({
    t,
    router: {
      query,
      query: { q },
    },
  }) => {
    const [search, setSearch] = useState(q)
    const onChangeSearch = (_, value) => setSearch(value)
    const [debouncedSearch] = useDebounce(search, 500)

    useEffect(() => {
      Router.replaceRoute('index', { ...query, q: debouncedSearch || null })
    }, [debouncedSearch])

    return (
      <Field
        label={t('repo/search/field/label')}
        value={search}
        error={
          q &&
          q.length < SEARCH_MIN_LENGTH &&
          t('repo/search/field/minLength', { count: SEARCH_MIN_LENGTH })
        }
        onChange={onChangeSearch}
      />
    )
  },
)

export default DebouncedSearch
