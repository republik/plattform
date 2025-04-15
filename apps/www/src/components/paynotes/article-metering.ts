type ArticleRead = {
  path: string
  readAt: Date
}

type MeteringConfig = {
  daysToExpire?: number // if undefined, the article never expires
  maxArticles: number
}

type ArticleMetering = {
  reads: ArticleRead[]
  config: MeteringConfig
}

const AB_CONFIGS: MeteringConfig[] = [
  { maxArticles: 1 },
  { maxArticles: 3, daysToExpire: 30 },
]

function isNotExpiredDate(readAt: Date, daysToExpire: number) {
  const readDate = new Date(readAt)
  const now = new Date()
  const daysDiff = Math.floor(
    (now.getTime() - readDate.getTime()) / (1000 * 3600 * 24),
  )
  return daysDiff < daysToExpire
}

const isNotExpiredRead =
  (daysToExpire: number | undefined) => (read: ArticleRead) =>
    !daysToExpire || isNotExpiredDate(read.readAt, daysToExpire)

function getRandomConfig(): MeteringConfig {
  const randomIndex = Math.floor(Math.random() * AB_CONFIGS.length)
  return AB_CONFIGS[randomIndex]
}

function generateMeteringObject(): ArticleMetering {
  return {
    reads: [],
    config: getRandomConfig(),
  }
}

// TODO: read and write metering object from/to local storage
// in the updateArticleMetering function
let metering = generateMeteringObject()

// TODO: write unit tests
export function updateArticleMetering(articlePath: string): {
  metering: ArticleMetering
  meteringStatus: 'READING_GRANTED' | 'READING_DENIED'
} {
  const { config, reads } = metering
  const { daysToExpire, maxArticles } = config

  // 1. check if the user has the article in reads array
  if (reads.find((read) => read.path === articlePath))
    return {
      metering,
      meteringStatus: 'READING_GRANTED',
    }

  // 2. clean-up stale articles from reads array
  const currentReads = reads.filter(isNotExpiredRead(daysToExpire))

  // 3. check if the user has any available reads left
  const hasAvailableReads = currentReads.length < maxArticles
  if (!hasAvailableReads) {
    return {
      metering: {
        ...metering,
        reads: currentReads,
      },
      meteringStatus: 'READING_DENIED',
    }
  }

  // 4. add the article to an updated reads array with the current date
  const updatedReads = [
    ...currentReads,
    {
      path: articlePath,
      readAt: new Date(),
    },
  ]
  return {
    metering: {
      ...metering,
      reads: updatedReads,
    },
    meteringStatus: 'READING_GRANTED',
  }
}
