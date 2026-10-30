# TODO: ProLitteris on Sanity

`scripts/batch-submit.js` (`prepare` command) still reads articles from
Elasticsearch. Elasticsearch is gone from the API, so `prepare` only works
against an old cluster that nobody maintains. `run` and `fetch-pixelIds.js` do
not touch Elasticsearch and keep working.

The tracking pixel (`apps/www/src/pages/api/prolitteris.ts`,
`ProlitterisTracking`) already runs on Sanity articles, so reads are counted
today. What is missing is the other half: reporting the articles themselves
(the "message") to ProLitteris, with structured contributors.

## What `prepare` does today

1. Reads repoIds (paths) from stdin or `-p`, and an authors JSON file
   (`-a`, `{id, firstName, lastName, prolitterisId}`) exported from the DB.
2. Queries ES for the published doc: `meta.title`, `meta.repoId`,
   `meta.contributors[] {name, userId, kind}` and `contentString`.
3. Builds a `MessageRequest`: `pixelUid` from the repoId, `messageText` as
   base64 plain text, `participants` from contributors of kind `text`.
4. Splits `name` into first and last name by the first space, unless the
   authors file has a match (by `userId`, else by full name).
5. Writes `prolitteris_input.jsonl`, which `run` submits.

## What has to change

### 1. Source: Sanity instead of ES

- Fetch articles from Sanity with GROQ by `_id` or slug, published only
  (no `drafts.` documents). Use `@orbiting/backend-modules-sanity`
  (`fetchDocumentsByIds`, `fetchArticlesByPaths` or a new query next to them)
  instead of a hand-rolled client.
- Input becomes Sanity ids or paths. Paths are the same `/YYYY/MM/DD/slug`
  as before, resolved with `fetchArticlesByPaths`. Repo ids are no longer
  a usable input, see 2.
- Drop `@elastic/elasticsearch` from `devDependencies` once this is done.
  `statistics/script/protagonistsStats.js` is the only other direct ES client
  user left in the repo.

### 2. Pixel UID must match what the site reports

`ProlitterisTracking` reports `repoId ?? sanityId` and the API route replaces
`/` with `-`, giving `vzm.<memberId>-<uid>`. The ID cannot change over time
or reads and message end up on different pixels.

- Legacy articles: the `repoId` string field on the Sanity article, stored
  as is (`org/repo`). Only when the pixel UID is built is the `/` replaced by
  `-`, because ProLitteris does not allow a slash in the UID. That happens in
  `/api/prolitteris` and in `repoIdToPixelUid` in the script. Do not rewrite
  the stored field.
- Newer articles: the Sanity `_id`.
- Share this rule in one helper (`repoId ?? sanityId`) instead of
  `repoIdToPixelUid` in the script plus the copy in the Next API route.

### 3. Content text

`contentString` came from the ES document. In Sanity the body is portable
text, so build the plain text from it (`@portabletext/toolkit` is already a
dependency of the sanity module, see `toPlainText`).

- Decide what belongs in the message text: lead, body, captions, pull quotes.
  Keep it the same as what ES `contentString` covered, so counts stay
  comparable. Needs a call with whoever owns the ProLitteris reporting.
- Keep `assertValidMessageText` and the size limit
  (`PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH`). Long articles must fail loudly,
  not be truncated.

### 4. Structured contributors instead of name strings

Sanity articles reference contributor documents (`contributors[].contributor`,
`_type == "contributor"`, with a `userId` link), see
`countArticlesByContributorUserIds` in `sanity/lib/document.ts`. Use them
instead of splitting a display name.

- Resolve `contributors[]` with the contributor documents (GROQ dereference).
  Take the role from the reference (replacing `kind`). Today only `text`
  becomes `AUTHOR`; check whether `Participation` (`TRANSLATOR`,
  `IMAGE_ORIGINATOR`) should be reported as well.
- First and last name come from structured fields, so the
  `split(' ')` heuristic and the `name` lookup in the authors file go away.
- ProLitteris member ID: today it comes from the authors JSON
  (`prolitterisId`, digits only, parsed to a number). The contributors module
  has `prolitteris_id`, `prolitteris_first_name` and `prolitteris_last_name`
  columns (`ArticleContributor` resolver, `upsertContributor` validates
  `^\d{6}$`). Open question: are these fields also on the Sanity contributor
  document, or only in Postgres? If only in Postgres, join on `userId` or the
  contributor id and drop the authors file. If they move to Sanity, Sanity is
  the single source and the Postgres columns can go later.
- `internalIdentification`: use the contributor's stable id (Sanity `_id`)
  so ProLitteris can match the same person across messages.
- Keep skipping participants without first and last name, and keep writing
  articles with no authors to `no_authors.prolitteris`.

### 5. Script housekeeping

- Remove the authors JSON flag (`-a`) if 4 makes it redundant, and update the
  header comment and `scripts/Readme.md` (the jq examples rely on the
  `participants` shape, which stays the same).
- Replace the hand-rolled `process.env.ELASRIC_PROD_URL` (sic) handling.
  Sanity access goes through the existing sanity client config.
- Consider a test for the mapping (Sanity doc to `MessageRequest`) next to
  `lib/__tests__/prolitteris.u.jest.ts`. Keep the function pure so it needs no
  Sanity access.

### 6. Beyond the batch script (separate decision)

The batch script is a one-off backfill. Check whether new articles should be
reported automatically, for example from the Sanity publish webhook or a
`PublikatorSyncWorker`-style job. If yes, the mapping from 3 and 4 should
live in `lib/` and be shared by the script and the job.

## Out of scope here

- The tracking pixel, opt-out consent and the `/api/prolitteris` route.
- `fetch-pixelIds.js`, which only talks to the ProLitteris API.
