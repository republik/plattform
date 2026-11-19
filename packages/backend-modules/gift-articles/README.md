# @orbiting/backend-modules-gift-articles

Lets paying members hand out a shareable link for a single article. Whoever opens it reads that one article without a
paywall for 14 days, without needing an account. The module stores nothing.

## `gift` token

```
?gift=<base64url(payload)>.<base64url(signature)>
payload = {"d":"<published Sanity _id>","e":<expiry, unix seconds>}
```

`www` checks the signature with the matching `GIFT_LINK_PUBLIC_KEY` in the route `/api/gift-token` (
`apps/www/src/app/api/gift-token/verify.ts`) before it reads the payload, then compares `d` with the article on screen
and `e` with the clock. Changing either breaks the signature.

Both keys are one line of base64 (DER), without PEM header, stored as env variables. Generate a pair with:

```bash
node -e "const {privateKey,publicKey}=require('crypto').generateKeyPairSync('ed25519');console.log('GIFT_LINK_PRIVATE_KEY='+privateKey.export({type:'pkcs8',format:'der'}).toString('base64'));console.log('GIFT_LINK_PUBLIC_KEY='+publicKey.export({type:'spki',format:'der'}).toString('base64'))"
```

## Mutation

**`createGiftArticleToken(documentId: ID!): String!`**

- Requires the `member` role.
- Signs the article and returns the token; no database access. The frontend appends it to the article URL as
  `?gift=<token>`.
