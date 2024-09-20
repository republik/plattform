import assert from 'node:assert'

type QueueConfig = {
  queueApplicationName: string
  connectionString: string
}

export function getConfig(): QueueConfig {
  assert(typeof process.env.DATABASE_URL === 'string', 'DATABASE_URL not set')

  return {
    queueApplicationName: 'job-queue',
    connectionString: process.env.DATABASE_URL,
  }
}
