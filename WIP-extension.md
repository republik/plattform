## Setup Guide for Development

1.  Checkout this branch
2.  Install dependencies

        yarn

3.  Fetch a fresh, new database dump

        heroku pg:pull (...)

4.  Update `.env` in backends root directory for more convenient development:
4.1 Set `DATABASE_URL` in `.env` if you pulled into a new database
4.2 Disabled sending emailss: `SEND_EMAILS=false`
4.3 Disable access grants scheduler: `ACCESS_SCHEDULER_OFF=true`
4.4 Disable preview requests scheduler: `PREVIEW_SCHEDULER_OFF=true`
4.5 Disable publication scheduler (optional): `PUBLICATION_SCHEDULER_OFF=true`

5.  Run migrations

        yarn db:migrate:up

6.  Run SQL statements from [WIP-extension.sql](./WIP-extension.sql)
7.  Develop

## Q:

- [x] Can a claimed membership (via package:ABO_GIVE) extended as a
      membershipType:BENEFACTOR_ABO? Would argue not. If inclined to provide
      more money, donate. _No. Same membershipType._
- [x] Can memberships from ABO_GIVE pledges be extended if unclaimed? _No._
- [x] Can non-active membership be extended? This might reactivate cancelled
      memberships, or stack unused membershipPeriods onto a membership. _No._
- [x] How often, how many periods can a membership be extended? _Once if active
      or inactive but used before._
- [x] Is FE aware of current crowdfunding phase? _Yes_

Flow to determine whether a prolong `packageOption` is returned.

Input:
- A membership
- A prolong packageOption, to check against

a)  Does user own membership, or pledge membership (ABO_GIVE)
    - If false, end and don't return package option
b)  Can membershipType be extended
    - If false, end
c)  Is membership active, or inactive and used
    - If false, end
d)  Has no membershipPeriod with beginDate in future
    - If false, end
e)  If membership.membershipType != option.membershipType
    - If true, indicate generation of new membership in customization
    payload, then proceed
f)  Has membership no notice of cancellation (optional)
    - If false, indicate revoking of cancellation, then proceed
g)  Does current, last period end within next x days (optional)
    - If false, end and hence don't return packageOption
h)  Is user or membership is eligible for bonusInterval
    - If true, add bonusInterval to customization payload, then proceed

Other:

- [ ] Indicate on user whether there is a dormant membership that will be used
      to extend active membership.
- [ ] Detach sequenceNumber from membership, attach min(sequenceNumber) to e.g.
      user entity once a membership is bought
