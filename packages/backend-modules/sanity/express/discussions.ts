import { Request, Response } from 'express'
import { logger } from '@orbiting/backend-modules-logger'
import { errorBody } from './respond'
import { isKillSwitchEnabled } from './killSwitch'

const {
  Discussion,
  DiscussionNotFoundError,
} = require('@orbiting/backend-modules-discussions')

// SANITY_DISCUSSIONS_ENABLED (pre-launch kill-switch, removable once Sanity
// discussions are live for real).
//
// Unlike publish-notifications/create-redirect, faking success here isn't
// safe: Studio's create-discussion Blueprint Function relies on the
// returned `id` to write `discussion.backendDiscussionId` back onto the
// Sanity document, and only does so once. A fake/omitted id would leave that
// link permanently missing rather than retried once this is switched on, so
// this responds with an explicit error while disabled instead of pretending
// to succeed.
export const isDiscussionsEnabled = () =>
  isKillSwitchEnabled('SANITY_DISCUSSIONS_ENABLED')

export const discussionsHandler =
  (pgdb: any, t: any) => async (req: Request, res: Response) => {
    const {
      id,
      title,
      maxLength,
      anonymity,
      tags,
      tagRequired,
      closed,
      path,
      hidden,
      disableTopLevelComments,
      collapsable,
      defaultOrder,
      allowedRoles,
    } = req.body || {}

    if (!isDiscussionsEnabled()) {
      logger.info(
        { id },
        'sanity discussions sync received while disabled, rejecting',
      )
      return res
        .status(503)
        .json(errorBody('sanity discussions sync is disabled'))
    }

    try {
      const settings = {
        title,
        maxLength,
        anonymity,
        tags,
        tagRequired,
        closed,
        path,
        hidden,
        disableTopLevelComments,
        collapsable,
        defaultOrder,
        allowedRoles,
      }

      // Safety net for content published before publikatorSync's own
      // synchronous discussion-linking existed (see
      // ../lib/publikatorSync/discussionRef.ts), or any other case that
      // slips through it: without this, a `Discussion.create` call arriving
      // with no `id` would insert a brand-new, orphaned row even when a
      // legacy discussion already exists for this path. The Sanity
      // discussion schema's own comment states "the backend identifies a
      // discussion by its path" -- this is a documented, intentional shared
      // key, not an incidental match. No loaders are available in this
      // Express handler (only pgdb), so this is a direct query.
      const existingByPath =
        !id && path ? await pgdb.public.discussions.findOne({ path }) : undefined

      const discussion = id
        ? await Discussion.update({ id, ...settings }, { pgdb, t })
        : existingByPath
          ? await Discussion.update(
              { id: existingByPath.id, ...settings },
              { pgdb, t },
            )
          : await Discussion.create(settings, { pgdb, t })

      res.json({ id: discussion.id })
    } catch (error: any) {
      const status = error instanceof DiscussionNotFoundError ? 404 : 400
      res.status(status).json({ error: error.message })
    }
  }
