import { fetchOffers } from '../../../lib/offers/offers'

export = async function getOffers() {
  const offers = (
    await Promise.all([
      await fetchOffers('PROJECT_R'),
      await fetchOffers('REPUBLIK'),
    ])
  ).flat()

  return offers
}
