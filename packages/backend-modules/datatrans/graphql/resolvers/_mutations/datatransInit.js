const { initTransaction } = require('../../../lib/helpers')

module.exports = async (_, args, context) => {
  const { pledgeId, service } = args
  const { loaders, pgdb } = context

  const pledge = await loaders.Pledge.byId.load(pledgeId)

  if (pledge.status !== 'DRAFT') {
    throw new Error('bla')
  }

  const pledgeOptionsWithAutoPay = await pgdb.public.pledgeOptions.count({
    pledgeId,
    autoPay: true,
  })

  const { authorizeUrl } = await initTransaction({
    refno: pledge.id,
    amount: pledge.total,
    service,
    createAlias: pledgeOptionsWithAutoPay > 0,
  })

  return { authorizeUrl }
}
