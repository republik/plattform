import { SendOptions } from 'pg-boss'

// Shared between express/publishNotification.ts (the enqueue call site) and
// PublishNotificationWorker.ts (the queue's default retry policy): Queue.send()
// does `options ?? worker.options`, so passing an explicit options object at
// the call site (needed to set singletonKey) replaces this entirely rather
// than merging with it — that call site spreads this in alongside
// singletonKey. Kept in its own module, rather than exported from
// PublishNotificationWorker.ts directly, so the handler doesn't have to pull
// in that file's `../article` → subscriptions/mailchimp import chain just to
// enqueue a job.
export const PUBLISH_NOTIFICATION_JOB_OPTIONS: SendOptions = { retryLimit: 0 }
