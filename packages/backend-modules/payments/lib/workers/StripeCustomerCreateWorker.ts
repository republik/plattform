import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job } from 'pg-boss'
import { Company } from '../types'
import { CustomerInfoService } from '../services/CustomerInfoService'

type Args = {
  $version: 'v1'
  userId: string
  company: Company
}

export class StripeCustomerCreateWorker extends BaseWorker<Args> {
  readonly queue = 'payments:stripe:customer:create'

  async perform([job]: Job<Args>[]): Promise<void> {
    if (job.data.$version !== 'v1') {
      throw Error('unable to perform this job version. Expected v1')
    }

    const id = await new CustomerInfoService(this.context.pgdb).createCustomer(
      job.data.company,
      job.data.userId,
    )

    if (typeof id === 'string') {
      return
    }
    throw Error('failed to create customers')
  }
}
