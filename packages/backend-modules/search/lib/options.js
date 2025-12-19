const debug = require('debug')('search:lib:options')

const {
  hasFullDocumentAccess,
} = require('@orbiting/backend-modules-documents/lib/restrictions')

const { DOCUMENTS_SAMPLES_REPO_IDS, DOCUMENTS_SAMPLES = 3 } = process.env

const sampleRepoIds = DOCUMENTS_SAMPLES_REPO_IDS?.split(',')

const processors = {
  formatFeedSamples: (args, context) => {
    const { filter } = args
    const { user } = context

    if (
      !!sampleRepoIds?.includes(filter?.format) &&
      !hasFullDocumentAccess(user, args.apiKey)
    ) {
      return {
        filters: [
          { key: 'format', value: filter.format },
          { key: 'feed', value: true },
          { key: 'type', value: 'Document' },
        ],
        sort: { key: 'publishedAt', direction: 'DESC' },
        samples: DOCUMENTS_SAMPLES,
      }
    }
  },
}

const encodeCursor = (options) => {
  return Buffer.from(
    JSON.stringify({
      ...options,

      // drop undesirable options
      processor: undefined,
      after: undefined,
      before: undefined,
      filter: undefined,
      trackingId: undefined,
    }),
  ).toString('base64')
}

// Parses a base64 encoded cursor (e.g. {after}, {before}).
// It won't contain any nullish props due to JSON stringify/parse.
const decodeCursor = (cursor) => {
  try {
    if (!cursor) {
      return false
    }

    return JSON.parse(Buffer.from(cursor, 'base64').toString())
  } catch (e) {
    console.warn('failed to parse cursor:', cursor, e)
    return false
  }
}

// Returns args as options w/o nullish props.
const cleanArgs = (args) =>
  Object.keys(args)
    .filter((key) => ![null, undefined].includes(args[key]))
    .reduce((prev, curr) => Object.assign(prev, { [curr]: args[curr] }), {})

// Processes search {args} and returns reasonable {options}.
// It removes nullish props.
const processArgs = (args, context) =>
  processors?.[args?.processor]?.(args, context) || cleanArgs(args)

// Returns options
const getOptions = (args, context) => {
  const { after, before } = args

  const defaults = {
    filter: {},
    filters: [],
    sort: { key: 'relevance', direction: 'DESC' },
    first: 40,
    from: 0,
    samples: false,
  }

  /**
   * If cursors {after} (1) or {before} (2) are provided, their contents
   * replace options provided: Changing search term or {first} won't have
   * any effect.
   */
  const options =
    decodeCursor(after) || decodeCursor(before) || processArgs(args, context)

  debug('getOptions: %o', {
    ...defaults,
    ...options,
  })

  return {
    ...defaults,
    ...options,
  }
}

module.exports = {
  encodeCursor,
  getOptions,
  getProcessorsList: () => Object.keys(processors),
}
