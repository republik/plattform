import { useState, useEffect } from 'react'
import {
  Field,
  mediaQueries,
  useDebounce,
  usePrevious,
  useColorContext,
  plainButtonRule,
} from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import withSearchRouter from './withSearchRouter'
import { useSearchResults } from './useSearchResults'
import { DEFAULT_SORT } from './constants'
import LiveState from './LiveState'
import { css } from 'glamor'

import withT from '@/lib/withT'
import { useRouter } from 'next/router'
import { IconClose } from '@republik/icons'

const styles = css({
  paddingTop: 15,
  [mediaQueries.mUp]: {
    paddingTop: 40,
  },
})

const Form = compose(
  withSearchRouter,
  withT,
)(
  ({
    startState,
    urlQuery,
    urlFilter,
    urlSort,
    pushSearchParams,
    getSearchParams,
    t,
    searchQuery,
    setSearchQuery,
    onSearchSubmit,
    emptyState,
  }) => {
    const router = useRouter()
    const [formValue, setFormValue] = useState(urlQuery)
    const [slowFormValue] = useDebounce(formValue, 200)
    const [colorScheme] = useColorContext()

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
      if (onSearchSubmit) {
        onSearchSubmit()
      }
    }

    const update = (_, value) => {
      setFormValue(value)
    }

    const reset = () => {
      setFormValue('')
      router.push('/suche')
    }

    return (
      <div {...styles}>
        <form onSubmit={submit} action='/suche'>
          <Field
            name='q'
            label={t('search/input/label')}
            value={formValue ?? ''}
            onChange={update}
            icon={
              !startState ? (
                <button {...plainButtonRule} onClick={reset} type='button'>
                  <IconClose
                    style={{ cursor: 'pointer' }}
                    size={30}
                    {...colorScheme.set('fill', 'text')}
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
  },
)

const FormWrapper = ({ onSearchSubmit, emptyState }) => {
  const [searchQuery, setSearchQuery] = useState()

  return (
    <Form
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSearchSubmit={onSearchSubmit}
      emptyState={emptyState}
    />
  )
}

export default FormWrapper
