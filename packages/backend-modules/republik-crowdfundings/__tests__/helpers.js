const { Users } = require('@orbiting/backend-modules-auth/__tests__/auth')

const pgDatabase = () => global.instance.context.pgdb

const prepareNewPledge = async ({
  templateId = '00000000-0000-0000-0008-000000000001',
  apolloFetch = global.instance.createApolloFetch(),
  ...options
} = {}) => {
  const packageOption = await pgDatabase().public.packageOptions.findOne({
    id: templateId,
  })
  const result = await submitPledge({
    total: packageOption.price,
    options: [
      {
        amount: 1,
        price: packageOption.price,
        templateId,
      },
    ],
    ...options,
    apolloFetch,
  })
  expect(result).toBeTruthy()
  return {
    pledgeId: result.data.submitPledge.pledgeId,
    userId: result.data.submitPledge.userId,
    apolloFetch,
  }
}

const SUBMIT_PLEDGE_MUTATION = `
  mutation submitPledge($total: Int!, $options: [PackageOptionInput!]!, $user: UserInput!, $reason: String) {
    submitPledge(pledge: {total: $total, options: $options, user: $user, reason: $reason}, consents: ["PRIVACY"]) {
      pledgeId
      userId
      emailVerify
      pfAliasId
      pfSHA
    }
  }
`

const submitPledge = ({
  user: userObject,
  apolloFetch = global.instance.apolloFetch,
  ...variables
}) => {
  const { email, firstName, lastName, phoneNumber } =
    userObject || Users.Unverified
  return apolloFetch({
    query: SUBMIT_PLEDGE_MUTATION,
    variables: {
      user: {
        email,
        firstName,
        lastName,
        phoneNumber,
      },
      ...variables,
    },
  })
}

const PAYMENT_METHODS = {
  STRIPE: 'STRIPE',
  POSTFINANCECARD: 'POSTFINANCECARD',
  PAYPAL: 'PAYPAL',
  PAYMENTSLIP: 'PAYMENTSLIP',
}

const PAY_PLEDGE_ADDRESS = {
  name: 'willhelm tell',
  line1: 'street 123',
  line2: '',
  postalCode: '8000',
  city: 'zurich',
  country: 'CH',
}

const PAY_PLEDGE_MUTATION = `
  mutation payPledge($pledgeId: ID!, $method: PaymentMethod!, $sourceId: String, $pspPayload: JSON, $address: AddressInput, $paperInvoice: Boolean) {
    payPledge(pledgePayment: {pledgeId: $pledgeId, method: $method, sourceId: $sourceId, pspPayload: $pspPayload, address: $address, paperInvoice: $paperInvoice}) {
      pledgeId
      userId
      emailVerify
      stripeClientSecret
      stripePaymentIntentId
      companyId
    }
  }
`

const payPledge = ({
  method,
  apolloFetch = global.instance.apolloFetch,
  ...variables
}) => {
  return apolloFetch({
    query: PAY_PLEDGE_MUTATION,
    variables: {
      address: PAY_PLEDGE_ADDRESS,
      method: PAYMENT_METHODS[method],
      ...variables,
    },
  })
}

const prepareParkingUserAndPledge = async () => {
  try {
    await pgDatabase().public.users.insert({
      id: process.env.PARKING_USER_ID,
      email: 'parking@test.project-r.construction',
      firstName: 'parking',
      lastName: 'parker',
    })
  } catch (e) {
    console.log(e)
  }
  try {
    await pgDatabase().public.pledges.insert({
      id: process.env.PARKING_PLEDGE_ID,
      userId: process.env.PARKING_USER_ID,
      packageId: '00000000-0000-0000-0007-000000000001',
      total: 0,
      donation: 0,
    })
  } catch (e) {
    console.log(e)
  }
}

const CANCEL_PLEDGE_MUTATION = `
  mutation cancelPledge($pledgeId: ID!) {
    cancelPledge(pledgeId: $pledgeId) {
      status
      memberships {
        active
        periods {
          beginDate
          endDate
        }
      }
    }
  }
`

const cancelPledge = async ({
  pledgeId,
  apolloFetch = global.instance.apolloFetch,
}) => {
  await prepareParkingUserAndPledge()
  return apolloFetch({
    query: CANCEL_PLEDGE_MUTATION,
    variables: {
      pledgeId,
    },
  })
}

const checkSeed = async () => {
  const apolloFetch = global.instance.createApolloFetch()
  const result = await apolloFetch({
    query: `
      {
        crowdfunding(name: "TEST") {
          id
          name
          packages {
            id
            name
            options {
              id
              price
              userPrice
              minAmount
              maxAmount
              defaultAmount
              reward {
                ... on MembershipType {
                  id
                  name
                }
                ... on Goodie {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
  })
  expect(result.data).toEqual({
    crowdfunding: {
      id: 'f0000000-0000-0000-0002-000000000001',
      name: 'TEST',
      packages: [
        {
          id: '00000000-0000-0000-0007-000000000001',
          name: 'ABO',
          options: [
            {
              id: '00000000-0000-0000-0008-000000000001',
              price: 24000,
              userPrice: true,
              minAmount: 1,
              maxAmount: 1,
              defaultAmount: 1,
              reward: {
                id: '00000000-0000-0000-0006-000000000001',
                name: 'ABO',
              },
            },
          ],
        },
        {
          id: '00000000-0000-0000-0007-000000000002',
          name: 'MONTHLY_ABO',
          options: [
            {
              id: '00000000-0000-0000-0008-000000000002',
              price: 2000,
              userPrice: false,
              minAmount: 1,
              maxAmount: 1,
              defaultAmount: 1,
              reward: {
                id: '00000000-0000-0000-0006-000000000002',
                name: 'MONTHLY_ABO',
              },
            },
          ],
        },
        {
          id: '00000000-0000-0000-0007-000000000003',
          name: 'PATRON',
          options: [
            {
              id: '00000000-0000-0000-0008-000000000003',
              price: 100000,
              userPrice: false,
              minAmount: 1,
              maxAmount: 1,
              defaultAmount: 1,
              reward: {
                id: '00000000-0000-0000-0006-000000000001',
                name: 'ABO',
              },
            },
            {
              id: '00000000-0000-0000-0008-000000000004',
              price: 3000,
              userPrice: false,
              minAmount: 2,
              maxAmount: 10,
              defaultAmount: 5,
              reward: {
                id: '00000000-0000-0000-0005-000000000001',
                name: 'SWEETS',
              },
            },
          ],
        },
        {
          id: '00000000-0000-0000-0007-000000000004',
          name: 'DONATION',
          options: [
            {
              id: '00000000-0000-0000-0008-000000000005',
              price: 1,
              userPrice: true,
              minAmount: 1,
              maxAmount: 1,
              defaultAmount: 1,
              reward: null,
            },
          ],
        },
        {
          id: '00000000-0000-0000-0007-000000000005',
          name: 'PRESENT',
          options: [
            {
              id: '00000000-0000-0000-0008-000000000006',
              price: 24000,
              userPrice: false,
              minAmount: 1,
              maxAmount: 1,
              defaultAmount: 1,
              reward: {
                id: '00000000-0000-0000-0006-000000000001',
                name: 'ABO',
              },
            },
          ],
        },
        {
          id: '00000000-0000-0000-0007-000000000020',
          name: 'ABO_COMPANY_TWO',
          options: [
            {
              id: '00000000-0000-0000-0008-000000000020',
              price: 12000,
              userPrice: false,
              minAmount: 1,
              maxAmount: 1,
              defaultAmount: 1,
              reward: {
                id: '00000000-0000-0000-0006-000000000020',
                name: 'ABO',
              },
            },
          ],
        },
      ],
    },
  })
}

const ADD_PAYMENT_SOURCE_MUTATION = `
  mutation addPaymentSource($sourceId: String!, $pspPayload: JSON!) {
    addPaymentSource(sourceId: $sourceId, pspPayload: $pspPayload) {
      isDefault
      status
      brand
      expMonth
      expYear
    }
  }
`

const addPaymentSource = ({
  sourceId,
  pspPayload,
  apolloFetch = global.instance.apolloFetch,
}) => {
  return apolloFetch({
    query: ADD_PAYMENT_SOURCE_MUTATION,
    variables: {
      sourceId,
      pspPayload,
    },
  })
}

const ADD_PAYMENT_METHOD_MUTATION = `
  mutation addPaymentMethod(
    $stripePlatformPaymentMethodId: ID!
    $companyId: ID!
  ) {
    addPaymentMethod(
      stripePlatformPaymentMethodId: $stripePlatformPaymentMethodId
      companyId: $companyId
    ) {
      stripeClientSecret
    }
  }
`

const addPaymentMethod = ({
  paymentMethodId,
  companyId,
  apolloFetch = global.instance.apolloFetch,
}) => {
  return apolloFetch({
    query: ADD_PAYMENT_METHOD_MUTATION,
    variables: {
      stripePlatformPaymentMethodId: paymentMethodId,
      companyId,
    },
  })
}

const DEFAULT_PAYMENT_SOURCE_QUERY = `
  query defaultPaymentSource {
    me {
      id
      defaultPaymentSource {
        id
        isDefault
        brand
        last4
        expMonth
        expYear
        isExpired
      }
    }
  }
`

const getDefaultPaymentSource = ({
  apolloFetch = global.instance.apolloFetch,
} = {}) => {
  return apolloFetch({
    query: DEFAULT_PAYMENT_SOURCE_QUERY,
  })
}

const SET_DEFAULT_PAYMENT_METHOD_QUERY = `
  mutation setDefaultPaymentMethod($stripePlatformPaymentMethodId: ID!) {
    setDefaultPaymentMethod(
      stripePlatformPaymentMethodId: $stripePlatformPaymentMethodId
    ) {
      id
      isDefault
      brand
      last4
      expMonth
      expYear
      isExpired
    }
  }
`

const setDefaultPaymentMethod = ({
  paymentMethodId,
  apolloFetch = global.instance.apolloFetch,
}) => {
  return apolloFetch({
    query: SET_DEFAULT_PAYMENT_METHOD_QUERY,
    variables: {
      stripePlatformPaymentMethodId: paymentMethodId,
    },
  })
}

const SYNC_PAYMENT_INTENT_QUERY = `
  mutation syncPaymentIntent($stripePaymentIntentId: ID!, $companyId: ID!) {
    syncPaymentIntent(
      stripePaymentIntentId: $stripePaymentIntentId
      companyId: $companyId
    ) {
      pledgeStatus
      updatedPledge
    }
  }
`

const syncPaymentIntent = ({
  paymentIntentId,
  companyId,
  apolloFetch = global.instance.apolloFetch,
}) => {
  return apolloFetch({
    query: SYNC_PAYMENT_INTENT_QUERY,
    variables: {
      stripePaymentIntentId: paymentIntentId,
      companyId,
    },
  })
}

module.exports = {
  prepareNewPledge,
  submitPledge,
  PAYMENT_METHODS,
  payPledge,
  cancelPledge,
  checkSeed,
  addPaymentSource,
  addPaymentMethod,
  getDefaultPaymentSource,
  setDefaultPaymentMethod,
  syncPaymentIntent,
}
