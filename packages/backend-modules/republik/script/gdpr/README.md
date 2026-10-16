# deleteUsers.js / retryExternalDeletions.js

Batch version of the `deleteUser` admin mutation. Deletes (or anonymises) a
list of users, then removes them from Stripe and Mailchimp and sends a
confirmation mail (`mail/templates/data_deletion_confirmation.html`).

Two scripts, sharing `deleteUsers.lib.js`:

- `deleteUsers.js` deletes users from a list of e-mails / user ids.
- `retryExternalDeletions.js` retries the Stripe / Mailchimp deletions that
  failed, from the log of a `deleteUsers.js` run.

The other scripts in this folder are separate.

**This is destructive and cannot be undone. It is a dry run unless you pass
`--no-dry-run`.** Always do a dry run first and read the log.

## What it does per user

Every user runs in its own DB transaction. A failure rolls back that user only.

1. Skips the user if they have an active membership or subscription, were
   already anonymised (`deletedAt` set), or own `publikator` data (editorial
   users, handle manually).
2. Deletes everything linked to the user (sessions, consents, credentials,
   devices, notifications, newsletter signups, bookmarks, ...) plus rows that
   only carry the e-mail address (`mailLog`, `tokens`, `leadTracking`,
   `mailchimpLog`, `l_mc_audience_check`).
3. Detaches comments from the user and unpublishes them (`--keep-comments`
   turns the unpublishing off).
4. Deletes membership and subscription cancellation reasons.
5. Users with pledges, invoices, orders, access grants, election candidacies
   or claimed memberships must be kept for bookkeeping. They are
   **anonymised**: e-mail becomes `<id>_deleted@republik.ch`, all personal
   columns (including first and last name) are nulled. Everyone else is
   **deleted**.
6. The user's address is deleted if nothing references it any more. If only
   bookkeeping rows (e.g. pledges) still do, the address stays but its name is
   cleared. An address shared with another user is left alone.

Only after the DB transaction **committed**:

7. Deletes the Stripe customer(s) at Stripe, for deleted **and** anonymised
   users, and removes the e-mail from all Mailchimp audiences. For anonymised
   users the local `stripeCustomers` rows stay as a reference (id, company,
   user), with the cached payment methods cleared. Charges, invoices and
   orders are not touched; they hold no personal data (amounts, status, ids,
   marketing metadata).
8. If both worked, sends the confirmation mail "Bestätigung Datenlöschung"
   from kontakt@republik.ch. It is sent through an adapter that does not write
   to `mailLog`, so the address is not stored again.

Slack gets one summary message with counts only. No names or e-mails.

## Input

E-mail addresses and/or user ids (uuid), as arguments or on **stdin**,
separated by whitespace, commas or semicolons. Lines starting with `#` are
ignored. Duplicates are removed.

```
a@example.org
3f0c1d52-8d1c-4f0e-9a4e-0d3b1e6f7a11
# comment
```

## Running on Heroku

**Shortcut:** `delete-users.sh` wraps all the commands below, so you normally
only need this.

```sh
S=packages/backend-modules/republik/script/gdpr/delete-users.sh

$S <app> delete users.txt                          # dry run (default)
$S <app> delete users.txt --no-dry-run             # real run
$S <app> retry deletion-logs/<log> --no-dry-run    # retry Stripe/Mailchimp
```

Run it from the repository root. `delete` takes the list of e-mails / user ids,
`retry` takes the log of an earlier `delete` run. Without `--no-dry-run` both
are dry runs.

What it does for you:

- checks that the `heroku` CLI is installed and you are logged in, and that the
  input file exists and is not empty
- adds `--allow-remote` to real runs and passes other flags through to the
  script (e.g. `--keep-comments`, `--no-slack`)
- before a real run it asks you to type the app name; `--yes` skips this
- runs `heroku run --no-tty` with your file on stdin and writes the output to
  `./deletion-logs/<app>-<delete|retry>-<dry|run>-<timestamp>.log` while also
  showing it on screen as readable progress lines (needs `jq`, otherwise raw JSON lines). Change the folder with the `LOG_DIR` environment
  variable. Log files are readable by you only. Do not commit them: they
  contain user ids and the e-mails of failed steps
- afterwards prints the exit code, the log path and (if `jq` is installed) the
  summary and the number of events that need attention, followed by the next
  command to run: the real run after a dry run, or the retry if something
  failed
- exits with the script's exit code (0 = fine, 1 = something failed, 2 =
  refused or bad input)

The manual commands, which the wrapper runs for you:

Prerequisites: Heroku CLI, access to the app, and a local `users.txt`.

Always put `--` before `node`: the Heroku CLI otherwise rejects the script's
flags (`--no-dry-run`, `--allow-remote`) as unknown. Use `-x` to get the
script's exit code, and `--no-tty` whenever you redirect stdin or stdout. Without it the CLI
attaches a terminal and the output gets mixed with terminal control characters.
Run from the repository root (the dyno's working directory), as for the other
scripts.

Heroku's `DATABASE_URL` is not local, so a real run **also needs
`--allow-remote`**. The script refuses to delete against a non-local database
without it.

```sh
APP=<heroku-app-name>
SCRIPT=packages/backend-modules/republik/script/gdpr/deleteUsers.js
```

### 1. Dry run (default)

Everything is executed and rolled back. Nothing is changed, nothing is sent.

```sh
heroku run --app $APP --no-tty -x -- node $SCRIPT < users.txt > dry-run.log
```

Read the log (see "Reading the log"). Check that the number of `user` events
matches what you expect and look at `skipped`, `not_found` and `error` events.
Start with a small batch (e.g. 10 users) the first time. Each user takes a few
seconds because of the large e-mail-keyed tables.

### 2. Real run

```sh
heroku run --app $APP --no-tty -x -- node $SCRIPT --no-dry-run --allow-remote \
  < users.txt > run-$(date +%Y-%m-%d-%H%M).log
```

**Keep the log file.** The dyno is thrown away, and the log is the only record
you have for retries. It contains the e-mail address of every user whose
Stripe/Mailchimp deletion or confirmation mail failed, so store it somewhere
private and delete it when everything is resolved.

Keep the CLI connected until it finishes; the process ends if the connection
drops. Use batches of a few hundred users. Do not run two batches at the same
time. A re-run of already processed input is harmless: deleted users are
reported as `not_found`, anonymised ones as `skipped` (already deleted).

The exit code is 0 when everything worked and 1 if any user rolled back or any
Stripe/Mailchimp/mail step failed (passed through by `heroku run -x`).

### 3. Retry failed Stripe / Mailchimp deletions

The DB rows of these users are already gone, so re-running the original list
does not help. Pipe the stored log into the retry script instead:

```sh
RETRY=packages/backend-modules/republik/script/gdpr/retryExternalDeletions.js

# dry run (default): lists what would be retried
cat run-2026-10-16-1030.log | heroku run --app $APP --no-tty -x -- node $RETRY

cat run-2026-10-16-1030.log | heroku run --app $APP --no-tty -x -- node $RETRY \
  --no-dry-run --allow-remote > retry-1.log
```

- It reads the log from **stdin only** (there is no file argument). Several
  logs can be concatenated.
- It retries only `external_failure` events of kind `stripe` and `mailchimp`.
  Other lines (including non-JSON lines) are ignored, duplicates are removed.
- It never writes to the DB and **never sends mails**.
- Output is the same kind of NDJSON log. If something fails again it is logged
  as `external_failure`, so `retry-1.log` can be retried the same way.

### 4. Users that did not get the confirmation mail

If Stripe/Mailchimp failed, or the mail send failed, no confirmation was sent
and the log has an `external_failure` event with `"kind":"confirmation_mail"`.
The retry script lists them as `confirmation_mail_pending` events (user id,
e-mail, reason) at the end of the retry. Those users need a confirmation
another way (e.g. manually from kontakt@republik.ch). Neither script has a
mode that sends them.

```sh
grep '"event":"confirmation_mail_pending"' retry-1.log
```

## Flags

`deleteUsers.js`:

| Flag | Default | Meaning |
|---|---|---|
| `--no-dry-run` | dry run | Actually delete. |
| `--allow-remote` | off | Needed for `--no-dry-run` when `DATABASE_URL` is not localhost (always on Heroku). |
| `--keep-comments` | off | Do not unpublish comments (they are detached either way). |
| `--no-slack` | Slack on | Do not post the summary to Slack. |

`retryExternalDeletions.js` only takes `--no-dry-run` and `--allow-remote`,
with the same meaning.

## Reading the log

The output is one JSON object per line (`ts`, `runId`, `event`, ...). Heroku
may merge library warnings (stderr) into the same stream, so a few lines can be
plain text. Use `jq -R 'fromjson?'` to skip them.

```sh
# overview
jq -R 'fromjson? | select(.event=="summary")' run.log
# per-user results and row counts
jq -R 'fromjson? | select(.event=="user") | {userId, outcome, totalRows, address}' run.log
# everything that needs attention
jq -R 'fromjson? | select(.event | IN("error","skipped","not_found","external_failure","warning"))' run.log
```

| Event | Meaning |
|---|---|
| `start`, `summary` | Run settings and totals. |
| `user_start` | Work on a user started (`index`/`total`, `userId`). |
| `progress` | Heartbeat every 5 s while one step runs longer than 5 s: which `phase` and for how many `seconds`. Long phases are normal on big tables (e.g. `mailchimpLog`). |
| `user_done` | After the DB commit: Stripe, Mailchimp and the confirmation mail finished (`externalMs`, `allDeleted`). Not logged in a dry run. |
| `warning` | Something was skipped, e.g. a table that does not exist in this environment. |
| `user` | One user's DB work done, with `durationMs` and the `slowPhases` (steps over 0.5 s): `outcome` is `deleted` or `anonymised`, with row counts per table. In a dry run `committed` is `false`. |
| `skipped` | Not touched, with the reason (active membership, already deleted, publikator data). |
| `not_found` | Input matched no user (or was already deleted). |
| `error` | The user's transaction failed and was rolled back. Listed in the final `retry` event under `dbFailedInputs`: run these again. |
| `external_failure` | Stripe, Mailchimp or the confirmation mail failed after the DB commit. Contains what a retry needs. For Mailchimp, "not a member of this audience" (HTTP 404) is normal and not a failure; only other statuses, e.g. 429 or 500, are. |
| `retry` | Final hint with the inputs to run again. |

Personal data in the log: user ids everywhere; e-mail addresses only in
`not_found`/`error` (the input you gave), `external_failure` and
`confirmation_mail_pending`.

## Environment

The dyno needs the usual app config: `DATABASE_URL`, the Mailchimp variables,
the Stripe keys (`STRIPE_PLATFORM`, `STRIPE_SECRET_KEY_*`, ...), the mail
settings (Mandrill or SMTP) and optionally `SLACK_CHANNEL_IT_MONITOR`. In
production `NODE_ENV=production` makes the mail real. Elsewhere mails are only
simulated unless `SEND_MAILS=true`.

## Limitations

- A mail the provider accepted but reported as failed (e.g. a timeout) counts
  as failed and is listed as pending, so it may be sent manually twice.
- Mandrill keeps its own copy of sent mails for its retention period.
- `mailchimpLog."oldEmail"` has no index, so each user scans that table.
- Not yet run end to end against Heroku. Do the small dry run first.
