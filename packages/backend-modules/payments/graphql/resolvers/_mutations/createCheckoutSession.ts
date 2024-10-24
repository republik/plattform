/* eslint-disable @typescript-eslint/no-unused-vars */
import { GraphqlContext } from '@orbiting/backend-modules-types'

type CreateCheckoutSessionArgs = {
  offerId: string
  promocode?: string
  options?: {
    customPrice: number
  }
}

export = async function createCheckoutSession(
  _root: never,
  _args: CreateCheckoutSessionArgs,
  _ctx: GraphqlContext,
) {
  return ''
}
