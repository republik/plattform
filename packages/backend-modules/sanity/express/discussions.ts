import { Request, Response } from 'express'

const { Discussion } = require('@orbiting/backend-modules-discussions')

export const discussionsHandler =
  (pgdb: any, t: any) => async (req: Request, res: Response) => {
    const { id, title, maxLength, anonymity, tags, tagRequired, closed } =
      req.body || {}

    try {
      const discussion = id
        ? await Discussion.update(
            { id, title, maxLength, anonymity, tags, tagRequired, closed },
            { pgdb, t },
          )
        : await Discussion.create(
            { title, maxLength, anonymity, tags, tagRequired, closed },
            { pgdb, t },
          )

      res.json({ id: discussion.id })
    } catch (error: any) {
      const status = error.message === t('api/discussion/404') ? 404 : 400
      res.status(status).json({ error: error.message })
    }
  }
