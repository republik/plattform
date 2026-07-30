# Bug: Play button silently fails for logged-in users

> Status: Backend fix shipped; the client-side fixes below (Ref-based queue
> mutations, error propagation) landed on `audio-queue-refs`. The `action-bar`
> branch still needs to switch `play-action.tsx` off the base64-`repoId`
> fallback described below to actually exercise the fix — see
> [Collections](./collections) for the broader context this bug is a symptom
> of.

Reported symptom: the play button on Sanity articles
(`apps/www/src/app/(sanity)/components/actions/play-action.tsx`) works when
logged out, but does nothing when logged in — no error, no playback, no
visible feedback.

## Root cause

Logged-in and logged-out users take different code paths, and only the
logged-out path works for Sanity content:

- **Logged out**: `useAudioQueue.tsx` (`handleAddQueueItem`) stores the item
  in local storage only — no server call, so it always "works".
- **Logged in**: the same function calls the `AddAudioQueueItems` GraphQL
  mutation (`AudioQueueOperations.gql`), which server-side
  (`packages/backend-modules/collections/lib/AudioQueue.js`, `upsertItem` /
  `getRepoId`) decodes the entity id as a legacy base64 `org/repoName` repoId
  and looks it up via `loaders.Document.byRepoId`
  (`packages/backend-modules/documents/loaders/Document.js`) — a lookup
  against the **legacy Elasticsearch `Document` index**, populated by the old
  Publikator publish pipeline. Sanity-authored articles are never indexed
  there, so the loader finds nothing and the resolver throws
  `missingDocument` (or `invalidEntityId` if the id isn't a valid repoId at
  all, which happens whenever the article has no legacy `repoId` and
  `play-action.tsx` falls back to the raw Sanity `_id`).
  Non-member logged-in users are also rejected earlier by
  `Roles.ensureUserHasRole(me, 'member')`.

That failure never reaches the UI: `AudioPlayerController.tsx`'s
`togglePlayer` catches the error and only sets local `hasError` state (never
exposed via `useAudioContext()`) plus a Sentry report; and
`AudioProvider.tsx`'s `toggleAudioPlayer` fires the toggle via
`AudioEventEmitter.emit(...)` without awaiting the listener, so the `await`
in `play-action.tsx`'s `onClick` resolves immediately regardless of what
happens downstream. The `try/catch` there was written expecting exactly this
failure mode (see its comment), but structurally can't observe it.

This is the same root problem [Collections](./collections) describes: the
Collections API's join key is a legacy base64 `repoId`, and Sanity content
doesn't have one. Audio queue is one more caller (alongside bookmarks and
reading position) that breaks until the API accepts Sanity document IDs.

## Fixes (done on `audio-queue-refs`)

1. **Accept Sanity document ids in the audio queue mutation.** Done backend-side:
   `addAudioQueueItemRef` / `userAudioQueue` and friends accept the same
   `repoId` / base64 documentId / Sanity `_id` forms as the rest of the
   collections API, and return `AudioQueueItemRef` (bare refs, no `document`)
   so Sanity-backed items are representable at all. `useAudioQueue.tsx` was
   rewritten around these; since refs carry no content, it caches whatever
   `AudioPlayerItem` the caller already had locally
   (`helpers/audioItemCache.ts`) and re-attaches it by id.
2. **Don't swallow queue mutation errors.** Done: `AudioPlayerController.tsx`'s
   `togglePlayer` now rethrows after `handleError`, and `AudioProvider.tsx`'s
   `toggleAudioPlayer` awaits the real outcome via a promise bridge instead of
   a fire-and-forget `emit` — callers like `play-action.tsx` can now `catch`
   a real failure instead of it disappearing into a `console.warn`.

`play-action.tsx` itself lives on `action-bar`, not here — it still needs to
stop computing its id from a base64-encoded `repoId` (see below) before any
of this takes effect for a reader.

## Client-side follow-up (not a substitute for the above)

Independent of the backend fix, `play-action.tsx` currently lets anyone click
play, including users with no access at all. Once the backend accepts
Sanity ids, the button should still be gated the same way
`bookmark-action.tsx` and `TeaserAudioPlayButton.tsx` already gate their
actions — via `useMe()` (`isMember` / `hasActiveMembership` /  `hasAccess`,
`apps/www/src/lib/context/MeContext.tsx`) — disabling the button (with a
"members only" style hint) for logged-in users without trial or membership
access, rather than letting the click silently fail.
