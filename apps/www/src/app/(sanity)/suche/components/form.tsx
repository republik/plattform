'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce, usePrevious, plainButtonRule } from '@project-r/styleguide'
import { css } from '@republik/theme/css'
import { IconClose } from '@republik/icons'

import { useTranslation } from '@/lib/withT'
import { useSearchUrl } from './use-search-url'
import { useSearchResults } from '../lib/use-search-results'
import { LiveState } from './live-state'
import { SearchField } from './search-field'
import { DEFAULT_SORT } from '../lib/constants'

const containerStyle = css({ pt: 4, md: { pt: 10 } })

export function Form({
  onSearchSubmit,
  emptyState,
}: {
  onSearchSubmit?: () => void
  emptyState?: React.ReactNode
} = {}) {
  const { t } = useTranslation()
  const router = useRouter()
  const { startState, urlQuery, urlFilter, urlSort, pushSearchParams, getSearchParams } =
    useSearchUrl()

  const [searchQuery, setSearchQuery] = useState<string | undefined>()
  const [formValue, setFormValue] = useState(urlQuery)
  const [slowFormValue] = useDebounce(formValue, 200)

  // Only fetches while the typed value diverges from the committed URL
  // query -- otherwise LiveState isn't even rendered (see below).
  const isLive = !!(formValue && urlQuery !== formValue)
  const dataAggregations = useSearchResults({
    searchQuery: searchQuery || urlQuery,
    filter: urlFilter,
    sort: urlSort,
    skip: !isLive,
  })

  useEffect(() => {
    setSearchQuery(slowFormValue)
  }, [slowFormValue])

  const previousUrlQuery = usePrevious(urlQuery)

  useEffect(() => {
    if (previousUrlQuery !== urlQuery) {
      setFormValue(urlQuery)
    }
  }, [urlQuery, previousUrlQuery])

  const submit = (e) => {
    e.preventDefault()
    pushSearchParams({
      q: formValue,
      sort: urlQuery ? undefined : DEFAULT_SORT,
    })
    onSearchSubmit?.()
  }

  const reset = () => {
    setFormValue('')
    router.push('/suche')
  }

  return (
    <div className={containerStyle}>
      <form onSubmit={submit} action='/suche'>
        <SearchField
          name='q'
          label={t('search/input/label')}
          value={formValue ?? ''}
          onChange={setFormValue}
          icon={
            !startState ? (
              <button {...plainButtonRule} onClick={reset} type='button'>
                <IconClose
                  className={css({ cursor: 'pointer', fill: 'text' })}
                  size={30}
                />
              </button>
            ) : undefined
          }
        />
      </form>
      {formValue && urlQuery !== formValue ? (
        <LiveState
          formValue={formValue}
          searchQuery={searchQuery}
          dataAggregations={dataAggregations}
          getSearchParams={getSearchParams}
          onClickSearchResults={onSearchSubmit}
        />
      ) : (
        emptyState
      )}
    </div>
  )
}
