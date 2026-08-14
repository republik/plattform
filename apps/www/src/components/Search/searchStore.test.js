import { getSnapshot, load, loadMore, subscribe } from './searchStore'

jest.mock('../../lib/errors/reportError', () => ({ reportError: jest.fn() }))

// Each test uses a fresh key, since the store is a module singleton and
// entries are only dropped once nobody is subscribed.
let keySeq = 0
const makeRequest = () => ({ key: `key-${++keySeq}` })

const page = (nodes, hasNextPage) => ({
  nodes,
  totalCount: 99,
  aggregations: [],
  pageInfo: { hasNextPage },
})

/** A `run` whose promises are settled by hand, one per requested page. */
const deferredRun = () => {
  const calls = []
  const run = jest.fn((request, pageNumber) => {
    let settle
    const promise = new Promise((resolve, reject) => {
      settle = { resolve, reject }
    })
    calls.push({ page: pageNumber, ...settle })
    return promise
  })
  return { run, calls }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('load', () => {
  it('serves four consumers of one key with a single request', async () => {
    const request = makeRequest()
    const { run, calls } = deferredRun()
    // index.js composes withAggregations *and* withResults; Filters.js and
    // Results.js compose one each.
    const unsubscribes = [0, 1, 2, 3].map(() =>
      subscribe(request.key, () => {}),
    )

    load(request, run)
    load(request, run)
    load(request, run)
    load(request, run)

    expect(run).toHaveBeenCalledTimes(1)

    calls[0].resolve(page(['a'], false))
    await flush()

    expect(getSnapshot(request.key).search.nodes).toEqual(['a'])
    expect(getSnapshot(request.key).loading).toBe(false)
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  })

  it('surfaces an error from a first load, and retries', async () => {
    const request = makeRequest()
    const { run, calls } = deferredRun()
    const unsubscribe = subscribe(request.key, () => {})

    load(request, run)
    calls[0].reject(new Error('boom'))
    await flush()

    expect(getSnapshot(request.key).error).toEqual(new Error('boom'))
    expect(getSnapshot(request.key).search).toBeUndefined()

    load(request, run)
    expect(run).toHaveBeenCalledTimes(2)
    unsubscribe()
  })
})

describe('loadMore', () => {
  const loadedRequest = async () => {
    const request = makeRequest()
    const { run, calls } = deferredRun()
    const unsubscribe = subscribe(request.key, () => {})
    load(request, run)
    calls[0].resolve(page(['a'], true))
    await flush()
    return { request, run, calls, unsubscribe }
  }

  it('appends the next page and ignores a repeat while in flight', async () => {
    const { request, run, calls, unsubscribe } = await loadedRequest()

    loadMore(request, run)
    loadMore(request, run)

    expect(run).toHaveBeenCalledTimes(2) // the initial load, plus one page 2
    expect(run).toHaveBeenLastCalledWith(request, 2)

    calls[1].resolve(page(['b'], false))
    await flush()

    expect(getSnapshot(request.key).search.nodes).toEqual(['a', 'b'])

    loadMore(request, run)
    expect(run).toHaveBeenCalledTimes(2) // hasNextPage is false now
    unsubscribe()
  })

  it('leaves the list intact when a page fails, and retries', async () => {
    const { request, run, calls, unsubscribe } = await loadedRequest()

    loadMore(request, run)
    calls[1].reject(new Error('nope'))
    await flush()

    const entry = getSnapshot(request.key)
    expect(entry.search.nodes).toEqual(['a'])
    expect(entry.error).toBeNull()

    // The failed page must not stay pinned in flight.
    loadMore(request, run)
    expect(run).toHaveBeenCalledTimes(3)
    expect(run).toHaveBeenLastCalledWith(request, 2)
    unsubscribe()
  })
})

describe('sweeping', () => {
  it('drops unsubscribed entries on the next load but keeps subscribed ones', async () => {
    const watched = makeRequest()
    const abandoned = makeRequest()
    const { run, calls } = deferredRun()

    const unsubscribe = subscribe(watched.key, () => {})
    load(watched, run)
    calls[0].resolve(page(['kept'], false))

    load(abandoned, run)
    calls[1].resolve(page(['dropped'], false))
    await flush()

    expect(getSnapshot(abandoned.key).search.nodes).toEqual(['dropped'])

    // A load for a third key sweeps the entry nobody is watching.
    const other = makeRequest()
    load(other, run)

    expect(getSnapshot(abandoned.key).search).toBeUndefined()
    expect(getSnapshot(watched.key).search.nodes).toEqual(['kept'])
    unsubscribe()
  })
})
