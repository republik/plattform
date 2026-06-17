# @orbiting/backend-modules-gift-articles

Lets paying subscribers generate shareable gift links for individual articles. Recipients get 14-day paywall-free access.

## Rules

- Only authenticated users with the `member` role can create gift links.
- Each subscriber can gift up to **10 distinct articles per calendar month**. Resharing the same article within the same month does not consume additional allowance.
- Gift links expire **14 days** after creation.
- `validateGiftToken` is a public query (no auth required) so recipients can redeem links without signing in.

## Database

One table, created by migration `20260617120000-gift-articles`:

### `giftArticleLinks`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `granterUserId` | uuid (FK → users) | ON DELETE CASCADE |
| `documentPath` | text | e.g. `/2026/06/15/some-article` |
| `token` | text (UNIQUE) | `crypto.randomUUID()`, used in `?gift=` query param |
| `createdAt` | timestamptz | defaults to `now()` |
| `expiresAt` | timestamptz | `createdAt + 14 days` |

Indexes: `granterUserId`, composite `(granterUserId, documentPath)`.

Monthly allowance is derived, not stored: `COUNT(DISTINCT "documentPath") WHERE granterUserId = $1 AND createdAt >= date_trunc('month', now())`.

## Attribution

Gift-to-conversion tracking piggybacks on the existing UTM mechanism. When a recipient opens a gift link, the frontend stores `gift_token` and `gift_article_path` in the `republik-utm` sessionStorage key. These values are included in the conversion payload via `getConversionPayload()` and end up in the `meta` JSONB field of trials, pledges, and newsletter signups — the same way UTM parameters are already tracked. No dedicated conversion table needed.

## GraphQL API

### Queries

**`giftArticleStatus(documentPath: String!): GiftArticleStatus!`** — Returns the caller's remaining gift allowance for the current month plus any existing link for this article. Returns 0 remaining for unauthenticated users.

**`validateGiftToken(token: String!): GiftTokenValidation`** — Public. Returns `null` for unknown tokens, `{ valid: false }` (with all other fields nulled) for expired tokens, or full validation result with granter info for valid tokens. Granter name/portrait are only included when `hasPublicProfile` is true; otherwise the name is "Ein Republik-Mitglied".

### Mutations

**`createGiftArticleLink(documentPath: String!): GiftArticleLink!`** — Requires `member` role. Wrapped in a transaction with `pg_advisory_xact_lock(hashtext('gift-article:' + userId))` to prevent race conditions. Returns the existing link if the same article was already gifted this month. Validates that `documentPath` starts with `/`.
