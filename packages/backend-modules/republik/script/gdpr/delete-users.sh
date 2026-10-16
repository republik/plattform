#!/usr/bin/env bash
#
# Runs deleteUsers.js / retryExternalDeletions.js on a Heroku app and keeps the
# log on this machine.
#
#   delete-users.sh <app> delete <list-file>            dry run (default)
#   delete-users.sh <app> delete <list-file> --no-dry-run
#   delete-users.sh <app> retry  <log-file>             dry run (default)
#   delete-users.sh <app> retry  <log-file>  --no-dry-run
#
# <list-file>  e-mails and/or user ids, one per line
# <log-file>   log of an earlier `delete` run
#
# Options (after the mode and file):
#   --no-dry-run   really delete / retry. Asks you to type the app name first
#                  and adds --allow-remote for you.
#   --yes          skip the confirmation (for --no-dry-run)
#   other flags are passed on to the script (e.g. --keep-comments, --no-slack)
#
# Environment:
#   LOG_DIR        where logs are written (default: ./deletion-logs)
#
# Logs contain user ids and, for failed steps, e-mail addresses. They are
# created readable by you only. Delete them once everything is resolved.
set -euo pipefail

SCRIPT_DIR=packages/backend-modules/republik/script/gdpr
LOG_DIR=${LOG_DIR:-./deletion-logs}

usage() {
  sed -n '3,22p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-2}"
}

die() {
  echo "error: $*" >&2
  exit 2
}

[[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && usage 0
[[ $# -ge 3 ]] || usage

APP=$1
MODE=$2
INPUT=$3
shift 3

case "$MODE" in
  delete) NODE_SCRIPT="$SCRIPT_DIR/deleteUsers.js" ;;
  retry) NODE_SCRIPT="$SCRIPT_DIR/retryExternalDeletions.js" ;;
  *) die "mode must be 'delete' or 'retry', got '$MODE'" ;;
esac

DRY_RUN=true
ASSUME_YES=false
EXTRA=()
for arg in "$@"; do
  case "$arg" in
    --no-dry-run) DRY_RUN=false ;;
    --yes) ASSUME_YES=true ;;
    --allow-remote) ;; # added automatically for real runs
    *) EXTRA+=("$arg") ;;
  esac
done

command -v heroku >/dev/null || die "heroku CLI not found"
heroku auth:whoami >/dev/null 2>&1 || die "not logged in, run: heroku login"
[[ -f "$INPUT" ]] || die "file not found: $INPUT"
[[ -s "$INPUT" ]] || die "file is empty: $INPUT"

if [[ "$MODE" == "delete" ]]; then
  COUNT=$(grep -cvE '^\s*(#|$)' "$INPUT" || true)
  WHAT="$COUNT input line(s)"
else
  COUNT=$(grep -c '"event":"external_failure"' "$INPUT" || true)
  WHAT="$COUNT external_failure event(s)"
fi

FLAGS=()
if [[ "$DRY_RUN" == false ]]; then
  FLAGS+=(--no-dry-run --allow-remote)
fi
# "${EXTRA[@]}" is unset-safe on bash 3.2 (macOS) only with this form
if [[ ${#EXTRA[@]} -gt 0 ]]; then
  FLAGS+=("${EXTRA[@]}")
fi

if [[ "$DRY_RUN" == false && "$ASSUME_YES" == false ]]; then
  echo "About to DELETE for real on app '$APP' ($MODE, $WHAT from $INPUT)."
  echo "This cannot be undone."
  read -r -p "Type the app name to continue: " CONFIRM
  [[ "$CONFIRM" == "$APP" ]] || die "app name does not match, aborting"
fi

umask 077
mkdir -p "$LOG_DIR"
STAMP=$(date +%Y-%m-%d-%H%M%S)
KIND=$([[ "$DRY_RUN" == true ]] && echo dry || echo run)
LOG="$LOG_DIR/$APP-$MODE-$KIND-$STAMP.log"

echo "app: $APP | mode: $MODE | $([[ "$DRY_RUN" == true ]] && echo 'DRY RUN' || echo 'REAL RUN') | $WHAT"
echo "log: $LOG"
echo

set +e
if [[ ${#FLAGS[@]} -gt 0 ]]; then
  heroku run --app "$APP" --no-tty node "$NODE_SCRIPT" "${FLAGS[@]}" <"$INPUT" | tee "$LOG"
else
  heroku run --app "$APP" --no-tty node "$NODE_SCRIPT" <"$INPUT" | tee "$LOG"
fi
STATUS=${PIPESTATUS[0]}
set -e

echo
echo "exit code: $STATUS (0 = all fine, 1 = something failed, 2 = refused/bad input)"
echo "log: $LOG"

if command -v jq >/dev/null; then
  echo
  echo "summary:"
  jq -R 'fromjson? | select(.event == "summary")' "$LOG" || true
  ATTENTION=$(jq -R 'fromjson? | select(.event | IN("error", "skipped", "not_found", "external_failure"))' "$LOG" | grep -c '"event"' || true)
  echo "events needing attention (error/skipped/not_found/external_failure): $ATTENTION"
fi

if [[ "$MODE" == "delete" && "$DRY_RUN" == true ]]; then
  echo
  echo "Looks right? Run for real:"
  echo "  $0 $APP delete $INPUT --no-dry-run"
elif [[ "$MODE" == "delete" ]] && grep -q '"event":"external_failure"' "$LOG"; then
  echo
  echo "Stripe/Mailchimp/mail steps failed. Retry (dry run first):"
  echo "  $0 $APP retry $LOG"
fi

exit "$STATUS"
