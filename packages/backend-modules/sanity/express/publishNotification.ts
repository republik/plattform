import { Request, Response } from 'express'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { logger } from '@orbiting/backend-modules-logger'

import { errorBody } from './respond'
import { isKillSwitchEnabled } from './killSwitch'

// SANITY_PUBLISH_NOTIFICATIONS_ENABLED (pre-launch kill-switch, removable
// once Sanity publish notifications are live for real).
//
// Unlike the rest of the Sanity webhook surface, there's no safe "it's fine,
// nobody's really using it yet" for this one: the moment this enqueues, real
// emails/push go out to real subscribers. Defaults to disabled so merging
// this feature doesn't turn on live sends before the agreed launch date.
// Mirrors the SANITY_SYNC_FROM_PUBLIKATOR_ENABLED pattern in
// publikatorSync/index.ts.
export const isPublishNotificationsEnabled = () =>
  isKillSwitchEnabled('SANITY_PUBLISH_NOTIFICATIONS_ENABLED')

// Handles the request sent by the studio repo's functions/sync-notifications
// Blueprint Function: POST { documentId }. Just enqueues the work and
// responds immediately — mirrors publikator's finalizePublication, which
// enqueues 'scheduler:publication:notify' rather than calling notifyPublish
// inline, so a publish/notify request never blocks on subscriber resolution
// and sending (push/email). See sanity/lib/workers/PublishNotificationWorker.ts
// for where the actual work happens.
export const publishNotificationHandler = async (
  req: Request,
  res: Response,
) => {
  const documentId = req.body?.documentId
  if (!documentId || typeof documentId !== 'string') {
    return res.status(400).json(errorBody('missing documentId'))
  }

  if (!isPublishNotificationsEnabled()) {
    logger.info(
      { documentId },
      'sanity publish-notification received while disabled, skipping',
    )
    return res.json({ success: true })
  }

  await Queue.getInstance().send('sanity:publish-notification', {
    $version: 'v1',
    documentId,
  })

  return res.json({ success: true })
}
