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

type MeteringStatus = 'READING_GRANTED' | 'READING_DENIED'

// We used to have one group with 3 reads per month: { maxArticles: 3, daysToExpire: 30 } 
// and one without (no expiration date): { maxArticles: 1 }.
// We stopped the test but kept the code in case we want to test other metering configurations.
const AB_CONFIGS: MeteringConfig[] = [{ maxArticles: 1 }]

const METERING_KEY = 'metering'

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

// try and retrieve the metering object from local storage
// if it doesn't exist, create a new one
function getMetering(): ArticleMetering {
  const metering = localStorage.getItem(METERING_KEY)
  if (!metering) return generateMeteringObject()
  return JSON.parse(metering)
}

// for analytics purposes
export function getMeteringData(prefix = ''): {
  [key: string]: string
} {
  if (typeof window === 'undefined') return {}
  if (!window.localStorage) return {}

  const metering = localStorage.getItem(METERING_KEY)
  if (!metering) return {}

  const config = (JSON.parse(metering) as ArticleMetering).config
  if (!config) return {}

  return {
    [prefix + 'metering_max_articles']: config.maxArticles.toString(),
    [prefix + 'metering_days_to_expire']: config.daysToExpire?.toString(),
  }
}

function setMetering(metering: ArticleMetering) {
  localStorage.setItem(METERING_KEY, JSON.stringify(metering))
}

// TODO: write unit tests
export function updateArticleMetering(articlePath: string): {
  meteringStatus: MeteringStatus
} {
  const metering = getMetering()
  //console.log('***METERING***', { metering })
  const { config, reads } = metering
  const { daysToExpire, maxArticles } = config

  // 1. check if the user already has the article in reads array
  if (reads.find((read) => read.path === articlePath))
    return { meteringStatus: 'READING_GRANTED' }

  // 2. clean-up stale articles from reads array
  const currentReads = reads.filter(isNotExpiredRead(daysToExpire))

  // 3. check if the user has any available reads left
  const hasAvailableReads = currentReads.length < maxArticles
  if (!hasAvailableReads) {
    setMetering({
      ...metering,
      reads: currentReads,
    })
    return { meteringStatus: 'READING_DENIED' }
  }

  // 4. add the article to an updated reads array with the current date
  const updatedReads = [
    ...currentReads,
    {
      path: articlePath,
      readAt: new Date(),
    },
  ]
  setMetering({
    ...metering,
    reads: updatedReads,
  })
  return { meteringStatus: 'READING_GRANTED' }
}
