# @orbiting/backend-modules-gift-articles

Lets paying members hand out a shareable link for a single article. Whoever
opens it reads that one article without a paywall for 14 days, without needing
an account.

The module stores nothing. A gift link is a signed token naming the article and
the expiry; neither the granter nor the recipient is recorded anywhere.

## Rules

- Only signed-in users with the `member` role can create a link. The action bar
  narrows that further and only offers the button to readers with an active
  membership or magazine subscription — the `member` role on its own also
  covers trial and "Abo teilen" readers. That narrowing is currently
  client-side only; see the note under _Open questions_.
- There is no limit on how many articles a member may gift.
- A link runs until the end of the UTC day 14 days after it was created, so
  for at least 14 and under 15 days.
- Every share of an article on the same day produces the same link, whoever
  shares it: the payload is the same, and Ed25519 signatures are
  deterministic.
- A single link can't be revoked. Replacing the key pair invalidates all of
  them at once.

## Token

```
?gift=<base64url(payload)>.<base64url(signature)>
payload = {"d":"<published Sanity _id>","e":<expiry, unix seconds>}
```

- `lib/links.js` (`signGiftToken`) signs the payload with
  `GIFT_LINK_PRIVATE_KEY`, an Ed25519 key given as
  one line of base64 (DER, PKCS#8; no PEM header). The key never leaves
  the API: whoever holds it can unlock any article.
- www checks the signature with the matching `GIFT_LINK_PUBLIC_KEY` in the
  route `/api/gift-token` (`apps/www/src/app/api/gift-token/verify.ts`)
  before it reads the payload, then compares `d` with the article on screen and
  `e` with the clock. Changing either breaks the signature.
- The article is identified by its Sanity id, not by its path: a slug can
  change, and a granter reading the draft and a recipient reading the
  published version have to end up with the same token. `toStoredDocumentId`
  normalises whatever the client sends (`sanity:<id>`, `drafts.<id>`, or a
  bare `_id`) down to the published id.

Both keys are one line of base64 (DER), without PEM header. Generate a pair
with:

```bash
node -e "const {privateKey,publicKey}=require('crypto').generateKeyPairSync('ed25519');console.log('GIFT_LINK_PRIVATE_KEY='+privateKey.export({type:'pkcs8',format:'der'}).toString('base64'));console.log('GIFT_LINK_PUBLIC_KEY='+publicKey.export({type:'spki',format:'der'}).toString('base64'))"
```

## Retention

There is no table, so there is nothing to clean up, and account deletion has
nothing to remove. The recipient's browser keeps a redeemed link in
localStorage for 90 days after it expires (`FORGET_AFTER_MS` in
`gift-access.ts`), so a returning reader is told the gift ran out.

## Attribution

Gift-to-conversion tracking piggybacks on the existing UTM mechanism. When a
recipient opens a gift link, the frontend writes `gift_token` and
`gift_document_id` into the `republik-utm` sessionStorage key. Those values
ride along in the conversion payload and end up in the `meta` JSONB of trials,
pledges and newsletter signups, exactly as UTM parameters already do. The token
names the article and the expiry, never the granter.

## GraphQL API

### Mutations

**`createGiftArticleLink(documentId: ID!, documentPath: String!): String!`**
— requires the `member` role. Signs the article and returns the gift link's
URL; no database access.

## Open questions

Together with the role-only server-side gate, there being no cap means a trial
reader who calls `createGiftArticleLink` directly can mint unlimited links,
even though the UI never offers them the button. If that matters, the gate
belongs in the mutation — an active-membership check rather than a role check.
