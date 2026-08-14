import { reportError } from '@/lib/errors/reportError'

/**
 * Deduplicates search requests and accumulates paginated results.
 *
 * index.js composes withAggregations *and* withResults, and Filters.js and
 * Results.js compose one each -- so four independent hooks ask for the same
 * (searchQuery, filter, sort) at once. Without this they would fire four
 * identical multi_search calls; the 200ms debounce in Form.js cannot help,
 * because those four are simultaneous rather than sequential.
 *
 * It deliberately does NOT cache across keys. There is no expiry and no
 * background revalidation: a key is fetched at most once while it is mounted,
 * and entries nobody is subscribed to are dropped on the next load. Going back
 * to a previous query refetches -- one multi_search, behind the debounce.
 */

const entries = new Map()
const listeners = new Map()

export const EMPTY_ENTRY = Object.freeze({
  search: undefined,
  loading: true,
  error: null,
})

const notify = (key) => listeners.get(key)?.forEach((listener) => listener())

const commit = (key, patch) => {
  entries.set(key, { ...entries.get(key), ...patch })
  notify(key)
}

/**
 * Applies a finished request's result and clears *only its own* page from the
 * in-flight map, so a concurrent sibling request keeps its bookkeeping. No-ops
 * if the entry has since been swept.
 */
const settle = (key, page, patch) => {
  const entry = entries.get(key)
  if (!entry) {
    return
  }
  commit(key, {
    ...patch,
    inflight: new Map(
      [...entry.inflight].filter(([inflightPage]) => inflightPage !== page),
    ),
  })
}

/**
 * Drops every entry nobody is subscribed to, except the one about to load.
 *
 * Deliberately not done on unsubscribe: React StrictMode double-invokes
 * effects (subscribe -> unsubscribe -> subscribe), which would momentarily
 * drop an in-flight entry and fire a duplicate request in development only.
 * Nothing here depends on timing.
 */
const sweep = (exceptKey) => {
  for (const key of [...entries.keys()]) {
    if (key !== exceptKey && !listeners.get(key)?.size) {
      entries.delete(key)
    }
  }
}

export const getSnapshot = (key) => entries.get(key) ?? EMPTY_ENTRY

export const subscribe = (key, onStoreChange) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set())
  }
  listeners.get(key).add(onStoreChange)
  return () => {
    const keyListeners = listeners.get(key)
    keyListeners?.delete(onStoreChange)
    if (keyListeners && keyListeners.size === 0) {
      listeners.delete(key)
    }
  }
}

/**
 * Loads page 1 for `request`. Concurrent callers for the same key share the
 * one request; an already-loaded key is not refetched. A key whose previous
 * attempt failed is retried -- the effect behind this only fires on key change
 * or remount, so that cannot loop.
 */
export const load = (request, run) => {
  const { key } = request
  sweep(key)

  const existing = entries.get(key)
  if (existing && !existing.error) {
    return existing.inflight.get(1) ?? Promise.resolve()
  }

  const promise = run(request, 1).then(
    (search) =>
      settle(key, 1, {
        search,
        loading: false,
        error: null,
        pages: new Set([1]),
      }),
    (error) => settle(key, 1, { loading: false, error }),
  )

  commit(key, {
    search: undefined,
    loading: true,
    error: null,
    pages: new Set(),
    inflight: new Map([[1, promise]]),
  })

  return promise
}

/**
 * Appends the next page to the loaded result. The page number comes from what
 * the entry already holds, so a repeat call while the first is in flight is a
 * no-op -- double-clicking "load more" cannot append twice.
 *
 * A failure is reported but not surfaced as `entry.error`: Results.js hands
 * `error` to Loader, which would replace the whole list to report a failed
 * append. Clearing the page instead leaves the button ready for a retry.
 */
export const loadMore = (request, run) => {
  const { key } = request
  const entry = entries.get(key)

  if (!entry?.search?.pageInfo?.hasNextPage || !entry.pages.size) {
    return Promise.resolve()
  }

  const page = Math.max(...entry.pages) + 1
  if (entry.inflight.has(page)) {
    return entry.inflight.get(page)
  }

  const promise = run(request, page).then(
    (next) => {
      const current = entries.get(key)
      if (!current?.search) {
        return
      }
      settle(key, page, {
        search: {
          ...current.search,
          ...next,
          nodes: [...current.search.nodes, ...next.nodes],
        },
        pages: new Set([...current.pages, page]),
      })
    },
    (error) => {
      reportError('search/loadMore', error)
      settle(key, page, {})
    },
  )

  commit(key, { inflight: new Map([...entry.inflight, [page, promise]]) })

  return promise
}
