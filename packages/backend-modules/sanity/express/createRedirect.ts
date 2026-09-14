import { Request, Response } from 'express'
import { logger } from '@orbiting/backend-modules-logger'
import { errorBody } from './respond'

const { Redirections } = require('@orbiting/backend-modules-redirections')

// SANITY_REDIRECTS_ENABLED (pre-launch kill-switch, removable once Sanity
// redirects are live for real).
//
// A redirect written here immediately affects live routing for real
// visitors (301s a real path to another real path) — same class of risk as
// SANITY_PUBLISH_NOTIFICATIONS_ENABLED, and for the same reason: a slug
// change made in Studio while content is still being prepared ahead of
// launch shouldn't be able to redirect a currently-live path away before
// the agreed cutover. Defaults to disabled.
export const isRedirectsEnabled = () =>
  process.env.SANITY_REDIRECTS_ENABLED === 'true'

// Handles the request sent by the studio repo's functions/redirect-slug-change
// Blueprint Function: POST { documentId, documentType, previousPath, newPath }
// — fired whenever a published article's or page's slug changes, so links to
// the old path keep working instead of 404ing.
//
// `resource` tags the row as Sanity-originated (vs. a publikator-era
// redirect) and identifies which document it belongs to, so Redirections.upsert
// re-points this document's own redirect chain on a later rename instead of
// creating a duplicate for it.
export const createRedirectHandler =
  (pgdb: unknown) => async (req: Request, res: Response) => {
    const { documentId, documentType, previousPath, newPath } = req.body || {}
    if (
      !documentId ||
      typeof previousPath !== 'string' ||
      typeof newPath !== 'string'
    ) {
      return res
        .status(400)
        .json(errorBody('missing documentId/previousPath/newPath'))
    }

    if (!isRedirectsEnabled()) {
      logger.info(
        { documentId, previousPath, newPath },
        'sanity create-redirect received while disabled, skipping',
      )
      return res.json({ success: true })
    }

    try {
      await Redirections.upsert(
        {
          source: previousPath,
          target: newPath,
          status: 301,
          resource: { sanity: { id: documentId, type: documentType } },
        },
        { pgdb },
      )
      return res.json({ success: true })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      return res.status(400).json(errorBody(message))
    }
  }
