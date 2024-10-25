import { fetchOffers } from '../../../lib/offers/offers'

export = async function getOffers() {
  const offers = (
    await Promise.all([
      await fetchOffers({ company: 'PROJECT_R', promoCode: 'EINSTIEG' }),
      await fetchOffers({ company: 'REPUBLIK', promoCode: 'EINSTIEG' }),
    ])
  ).flat()

  return offers
}
