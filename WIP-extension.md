Q:

- [ ] Can memberships from ABO_GIVE pledges be extended if unclaimed?
- [ ] Can non-active membership be extended? This might reactivate cancelled
      memberships, or stack unused membershipPeriods onto a membership.
- [ ] How often, how many periods can a membership be extended?
- [x] Is FE aware of current crowdfunding phase? _Yes_

Flow to determine whether a prolong `packageOption` is returned.

Input:
- A membership
- A prolong packageOption, to check against

a)  Does user own membership, or pledge membership (ABO_GIVE)
    - If false, end and don't return package option
b)  Is membership active
    - If false, end
c)  Is current membershipPeriod last period
    - If false, end
d) Can membership.type be extend
    - If false, end
e)  If membership.membershipType != option.membershipType
    - If true, indicate generation of new membership in customization
    payload, then proceed
f)  Has membership no notice of cancellation (tbc.)
    - If false, end
g)  Does current, last period end within next x days (tbc.)
    - If false, end and hence don't return packageOption
h)  Has user dormant membership which can be used (tbc.)
    - If true, add viable dormant membership to customization payload,
    then proceed
i)  Is user or membership is eligible for bonusInterval
    - If true, add bonusInterval to customization payload, then proceed

Other:

- [ ] Detach sequenceNumber from membership, attach min(sequenceNumber) to e.g.
      user entity once a membership is bought

submitPledge:

```gql
mutation {
  submitPledge(pledge: {total: 24000, user: {email: "patrick.recher@republik.ch", firstName: "Patrick", lastName: "Recjer"}, options: [{templateId: "00000000-0000-0000-0000-000000000000", amount: 1, price: 24000}]}) {
    pfSHA
    pledgeId
    userId
  }
}
```

resulting pledge:

```
{
  "createdAt": "2018-11-02T16:13:12.437Z",
  "id": "00000000-0000-0000-0000-000000000000",
  "total": 24000,
  "status": "DRAFT",
  "package": {
    "name": "ABO_GIVE",
    "options": [
      {
        "id": "00000000-0000-0000-0000-000000000000"
      },
      {
        "id": "00000000-0000-0000-0000-000000000000"
      },
      {
        "id": "00000000-0000-0000-0000-000000000000"
      }
    ]
  },
  "options": [
    {
      "id": "00000000-0000-0000-0000-000000000000-00000000-0000-0000-0000-000000000000",
      "reward": {
        "id": "00000000-0000-0000-0000-000000000000",
        "name": "ABO"
      }
    }
  ]
}
```

```gql
{
  crowdfundings {
    name
    beginDate
    endDate
    endVideo {
      mp4
      youtube
      subtitles
      poster
    }
    packages {
      name
      options {
        price
        minAmount
        maxAmount
        minUserPrice
        userPrice
        reward {
          ... on Goodie {
            name
          }
          ... on MembershipType {
            id
            name
            interval
            intervalCount
          }
        }
      }
    }
  }
}
```

```
{
  "name": "PROLONG",
  "options": [
    {
      "price": 24000,
      "minAmount": 1,
      "maxAmount": 100,
      "minUserPrice": 0,
      "userPrice": true,
      "reward": {
        "name": "ABO",
        "interval": "year",
        "intervalCount": 1
      }
    },
    {
      "price": 100000,
      "minAmount": 1,
      "maxAmount": 1,
      "minUserPrice": 0,
      "userPrice": false,
      "reward": {
        "id": "00000000-0000-0000-0000-000000000000",
        "name": "BENEFACTOR_ABO",
        "interval": "year",
        "intervalCount": 1
      }
    }
    {
      "price": 2000,
      "minAmount": 0,
      "maxAmount": 100,
      "minUserPrice": 0,
      "userPrice": false,
      "reward": {
        "name": "NOTEBOOK"
      }
    },
    {
      "price": 2000,
      "minAmount": 0,
      "maxAmount": 100,
      "minUserPrice": 0,
      "userPrice": false,
      "reward": {
        "name": "TOTEBAG"
      }
    }
  ]
}
```
