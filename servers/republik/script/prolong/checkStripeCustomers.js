require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const getClients = require('../modules/crowdfundings/lib/payments/stripe/clients')
const moment = require('moment')

const CHECK_PAYMENTS_BEFORE_DATE = new Date('2018-01-15')
const CARDS_VALID_BEFORE_DATE = moment('2019-01-21')

const getList = async (starting_after, account) => {
  return account.stripe.customers.list(
    {
      limit: 100,
      ...starting_after ? { starting_after } : {}
    }
  )
}

const getAllCustomers = async (account) => {
  let allCustomers = []

  let hasMore = false
  let starting_after
  let counter = 1
  do {
    console.log(`getting customers list (${counter++})...`)
    const list = await getList(starting_after, account)
    hasMore = list.has_more
    const customers = list.data
    starting_after = customers[customers.length - 1].id
    allCustomers = allCustomers.concat(customers)
    console.log(`now got ${allCustomers.length} customers. hasMore ${hasMore}.`)
  } while (hasMore && starting_after)
  return allCustomers
}

PgDb.connect().then(async pgdb => {
  const { accounts } = await getClients(pgdb)

  const userIds = await pgdb.queryOneColumn(`
    select
      DISTINCT(p."userId")
    FROM
      payments pay
    JOIN
      "pledgePayments" pp
      ON pp."paymentId" = pay.id
    JOIN
      pledges p
      ON pp."pledgeId" = p.id
    where
    pay."createdAt" < :CHECK_PAYMENTS_BEFORE_DATE
  `, {
    CHECK_PAYMENTS_BEFORE_DATE
  })

  // card backing source on all companies is the same
  const company = await pgdb.public.companies.findOne({
    name: 'PROJECT_R'
  })
  const account = accounts.find(a => a.company.id === company.id)

  const customers = await getAllCustomers(account)

  let numValid = 0
  let numWithCard = 0
  let numOfInterest = 0
  customers.forEach(customer => {
    if (!customer.metadata || !customer.metadata.userId) {
      return
    }
    const userId = customer.metadata.userId
    if (!userIds.find(id => id === userId)) {
      return
    }
    numOfInterest++
    if (!customer.sources || !customer.sources.data[0] || !customer.sources.data[0].card) {
      return
    }
    const card = customer.sources.data[0].card
    numWithCard++
    const expires = moment(`${card.exp_year}-${card.exp_month}`, 'YYYY-MM').startOf('month')
    if (CARDS_VALID_BEFORE_DATE.isBefore(expires)) {
      numValid++
    }
  })
  const total = customers.length
  console.log(`numValid: ${numValid} of \nwithCard: ${numWithCard} of \nnumOfInterest: ${numOfInterest} of \ntotal: ${total}.\nturnout: ${100 / total * numWithCard}%\ndueDate:${CARDS_VALID_BEFORE_DATE}`)
  // console.log(util.inspect(customers, { depth: null }))
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
