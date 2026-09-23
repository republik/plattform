# @orbiting/backend-modules-gift-articles

Lets paying members hand out a shareable link for a single article. Whoever
opens it reads that one article without a paywall for 14 days, without needing
an account.

## Rules

- Only signed-in users with the `member` role can create a link. The action bar
  narrows that further and only offers the button to readers with an active
  membership or magazine subscription — the `member` role on its own also
  covers trial and "Abo teilen" readers. That narrowing is currently
  client-side only; see the note under *Open questions*.
- There is no limit on how many articles a member may gift.
- A link lives **14 days**. Sharing the same article again while its link is
  still live hands out that same link; once it has run out, the next share
  mints a fresh one.
- `validateGiftToken` is public — recipients redeem links without signing in.

## Database

One table, created by migration `20260922120000-gift-articles`:

### `giftArticleLinks`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `granterUserId` | uuid (FK → users) | ON DELETE CASCADE |
| `documentId` | text | bare, published Sanity `_id` — same form as `collectionDocumentItems."sanityId"` |
| `documentPath` | text | slug snapshot, only used to build the link's URL |
| `token` | text (UNIQUE) | `crypto.randomUUID()`, travels as the `?gift=` query param |
| `createdAt` | timestamptz | defaults to `now()` |
| `expiresAt` | timestamptz | `createdAt + 14 days` |

The article is identified by its Sanity id, not by its path: a slug can change,
and a granter reading the draft and a recipient reading the published version
have to land on the same row. `lib/links.js` normalises whatever the client
sends (`sanity:<id>`, `drafts.<id>`, or a bare `_id`) down to the published id,
and hands it back out over GraphQL as the `sanity:`-prefixed ref the frontend's
`collectionsDocumentId()` builds.

No foreign key on `documentId` — Sanity documents don't live in this database.

## Attribution

Gift-to-conversion tracking piggybacks on the existing UTM mechanism. When a
recipient opens a gift link, the frontend writes `gift_token` and
`gift_document_id` into the `republik-utm` sessionStorage key. Those values
ride along in the conversion payload and end up in the `meta` JSONB of trials,
pledges and newsletter signups, exactly as UTM parameters already do. No
dedicated conversion table.

## GraphQL API

### Queries

**`validateGiftToken(token: String!): GiftTokenValidation`** — public. `null`
for an unknown token. Otherwise `valid` says whether the link is still live,
and `documentId` / `documentPath` / `expiresAt` are reported either way, so the
frontend can tell "this link ran out" from "this link is for another article".
`granter` is only set for a live link; the name is the granter's own only when
their profile is public, otherwise "Ein Republik-Mitglied".

### Mutations

**`createGiftArticleLink(documentId: ID!, documentPath: String!): GiftArticleLink!`**
— requires the `member` role. Returns the member's existing live link for the
article if there is one, otherwise creates one. Runs in a transaction behind
`pg_advisory_xact_lock(hashtext('gift-article:' + userId))`, so two action bars
on the same page can't mint two tokens for one article.

## Open questions

The monthly per-member cap this module originally had was removed before the
port. Together with the role-only server-side gate, that means a trial reader
who calls `createGiftArticleLink` directly can mint unlimited links, even
though the UI never offers them the button. If that matters, the gate belongs
in the mutation — an active-membership check rather than a role check.
