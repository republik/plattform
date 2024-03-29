import { useState, useEffect } from 'react'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'
import { Field, useDebounce } from '@project-r/styleguide'
import { withRouter } from 'next/router'

export const SEARCH_MIN_LENGTH = 3

const DebouncedSearch = compose(
  withT,
  withRouter,
)(({ t, router }) => {
  const { query } = router
  const { q } = query
  const [search, setSearch] = useState(q)
  const onChangeSearch = (_, value) => setSearch(value)
  const [debouncedSearch] = useDebounce(search, 500)

  useEffect(() => {
    const params = new URLSearchParams(router.query)
    if (debouncedSearch) {
      params.set('q', debouncedSearch)
    } else {
      params.delete('q')
    }
    router.replace({
      pathname: '/',
      query: params.toString(),
    })
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
})

export default DebouncedSearch
