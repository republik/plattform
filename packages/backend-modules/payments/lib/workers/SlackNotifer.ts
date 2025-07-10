import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import slack from '@orbiting/backend-modules-slack'

type Args = {
  $version: 'v1'
  channel: string
  message: string
}

export class SlackNotifierWorker extends BaseWorker<Args> {
  readonly queue = 'slack:noifier'
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 60, // retry every 1 minutes
  }

  async perform([job]: Job<Args>[]): Promise<void> {
    if (!job.data.channel) {
      console.info(`Slack chancel not defined: noop`)
      return
    }

    return slack.publish(job.data.channel, job.data.message)
  }
}
