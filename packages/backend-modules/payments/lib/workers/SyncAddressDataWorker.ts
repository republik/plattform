import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Address } from '../types'
import { Job } from 'pg-boss'
import { CustomerInfoService } from '../services/CustomerInfoService'

type Args = {
  $version: 'v1'
  userId: string
  address: Address
}

export class SyncAddressDataWorker extends BaseWorker<Args> {
  readonly queue = 'payments:stripe:checkout:sync-address'

  async perform([job]: Job<Args>[]): Promise<void> {
    const customerService = new CustomerInfoService(this.context.pgdb)
    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'start')

    await customerService.updateUserAddress(job.data.userId, job.data.address)

    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'done')
    return
  }
}
