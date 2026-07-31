import { Request, Response } from 'express'
// Brings in the `req.log` augmentation on express's Request.
import type {} from '@orbiting/backend-modules-logger'

import { getSubscriberCountForArticle } from '../lib/article'

// Sanity ids: plain ids, `drafts.<id>`, or `versions.<releaseName>.<id>` —
// loose validation is defense-in-depth only, the id itself is passed as a
// parameterized GROQ variable ($id), never interpolated into the query.
const SANITY_ID_RE = /^[a-zA-Z0-9_.-]{1,200}$/

// Called directly by studio's browser UI (workspaces/newsroom) to show
// editors how many subscribers a publish-with-notifications decision would
// reach, without waiting for/depending on the actual publish-notification
// flow. Read-only, no side effects — see lib/article.ts#getSubscriberCountForArticle.
export const subscriberCountHandler =
  (context: any) => async (req: Request, res: Response) => {
    const documentId = req.query.documentId
    if (
      !documentId ||
      typeof documentId !== 'string' ||
      !SANITY_ID_RE.test(documentId)
    ) {
      return res.status(400).json({ error: 'missing or invalid documentId' })
    }

    try {
      const result = await getSubscriberCountForArticle(documentId, context)
      if (!result) {
        // Not found in Sanity (e.g. a brand-new draft not yet queryable
        // under the 'raw' perspective) — this is a UI hint, not a resource
        // lookup, so read as zero rather than erroring.
        return res.json({ totalCount: 0 })
      }
      return res.json(result)
    } catch (error: any) {
      req.log.error({ error, documentId }, 'failed to compute subscriber count')
      return res.status(500).json({ error: 'internal error' })
    }
  }
