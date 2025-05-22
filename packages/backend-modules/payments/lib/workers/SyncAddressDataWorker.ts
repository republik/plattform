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
    console.log(`start ${this.queue} worker`)

    await customerService.updateUserAddress(job.data.userId, job.data.address)

    console.log(`success ${this.queue} worker`)

    return
  }
}
