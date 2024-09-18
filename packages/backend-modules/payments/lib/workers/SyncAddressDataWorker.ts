import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Address } from '../types'
import { Job } from 'pg-boss'
import { Payments } from '../payments'

type Args = {
  $version: 'v1'
  userId: string
  address: Address
}

export class SyncAddressDataWorker extends BaseWorker<Args> {
  readonly queue = 'checkout:customer:address:sync'

  async perform([job]: Job<Args>[]): Promise<void> {
    const PaymentService = Payments.getInstance()
    console.log(`start ${this.queue} worker`)

    await PaymentService.updateUserAddress(job.data.userId, job.data.address)

    console.log(`success ${this.queue} worker`)

    return
  }
}
