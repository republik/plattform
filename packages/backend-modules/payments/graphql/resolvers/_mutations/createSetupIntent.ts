import { GraphqlContext } from '@orbiting/backend-modules-types'
import { Company } from '../../../lib/types'
import Auth from '@orbiting/backend-modules-auth'
import { PaymentService } from '../../../lib/services/PaymentService'
import { CustomerInfoService } from '../../../lib/services/CustomerInfoService'
import { UpgradeSetupSessionBuilder } from '../../../lib/shop/UpgradeSetupSessionBuilder'

export = async function syncPaymentMethods(
  _root: never,
  args: {
    companyName: Company
    options: { uiMode: any }
  },
  ctx: GraphqlContext,
) {
  Auth.ensureSignedIn(ctx)

  const csb = new UpgradeSetupSessionBuilder(
    args.companyName,
    new PaymentService(),
    new CustomerInfoService(ctx.pgdb),
    ctx.logger,
  )

  return csb.withCustomer(ctx.user).withUIMode(args.options.uiMode).build()
}
