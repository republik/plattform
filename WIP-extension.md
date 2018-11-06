Q:

- [ ] Is FE aware of current crowdfunding phase?


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
