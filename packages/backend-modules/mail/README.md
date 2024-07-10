# @orbiting/backend-modules-mail

Send simple and templated mails via Mandrill or Nodemailer.

## Important for automatic generation of plaintext mails

Do not introduce linebreaks inside of html link tags, otherwise the transactional service doesn't recognise them as links in the automatically generated plaintext version.

## Send mails to specific segments

### Send mail to users with cleaned Mailchimp status

We have a weekly job which sends mails to users who were cleaned from Mailchimp. This mailing can also be triggered manually be executed the following script:

Run `script/sendMailsToSegment/cleanedUserSubscriptionInvitation.js`

These optional command line arguments can be used:

- `--no-dry-run`: used to really send emails, defaults to `--dry-run` which queries segment but no mails will be sent or mail log entries will be created
- `--no-once-for`: used to be able to send the same template mail multiple times, defaults to `--once-for`
- `--from=YYYY-MM-DD`: from date for user segment query, defaults to 30 days ago
- `--to=YYYY-MM-DD`: to date for user segment query, defaults to today

### Send special mail to users of special access campaign

This script was used to send an email about dialogue and a Republik event to all grant recipients of a special access campaign on a specific date.

Run `node script/sendMailsToSegment/specialAccessCampaignMailing_kampa202202.js`.
These optional command line arguments can be used:

- `--no-dry-run`: used to really send emails, defaults to `--dry-run` which queries segment but no mails will be sent or mail log entries will be created
- `--no-once-for`: used to be able to send the same template mail multiple times, defaults to `--once-for`
- `limit=100`: limit segment query to a certain number of rows (e.g. 100), defaults to all rows
