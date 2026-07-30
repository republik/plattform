import { Request, Response } from 'express'
import { Queue } from '@orbiting/backend-modules-job-queue'

import { errorBody } from './generateAudio'

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

  await Queue.getInstance().send('sanity:publish-notification', {
    $version: 'v1',
    documentId,
  })

  return res.json({ success: true })
}
