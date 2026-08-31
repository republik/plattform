import { Request, Response } from 'express'
import { errorBody } from './respond'

const { Redirections } = require('@orbiting/backend-modules-redirections')

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
