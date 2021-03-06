# @orbiting/backend-modules-mail

Send simple and templated mails via Mandrill or Nodemailer, and manage subscriptions on MailChimp.

## Generate plain-text emails from existing HTML templates

1. Run `script/generateTextTemplates.js`
2. Edit `.txt` templates to fit your ASCII beautification needs.

## Send mails to specific segments

### Send mail to users with cleaned Mailchimp status

Send a mail to users which were cleaned from mailchimp during a certain time period.

Run `script/sendMailsToSegment/cleanedUserSubscriptionInvitation.js`

Three optional command line arguments can be used:

- `--no-dry-run`: used to really send emails, defaults to `--dry-run` which queries segment but no mails will be sent or mail log entries will be created
- `--from=YYYY-MM-DD`: from date for user segment query, defaults to 30 days ago
- `--to=YYYY-MM-DD`: to date for user segment query, defaults to today

### Send special mail to users of special access campaign

This script was used to send an email about dialogue and a Republik event to all grant recipients of a special access campaign on a specific date.

Run `node script/sendMailsToSegment/specialAccessCampaignMailing_kampa202202.js`.
Two optional command line arguments can be used:

- `--no-dry-run`: used to really send emails, defaults to `--dry-run` which queries segment but no mails will be sent or mail log entries will be created
- `limit=100`: limit segment query to a certain number of rows (e.g. 100), defaults to all rows
