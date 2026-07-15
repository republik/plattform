import Stripe from 'stripe'
import { PgDb } from 'pogi'

const PROJECT_R_STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY_PROJECT_R
const REPUBLIK_STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY_REPUBLIK
const DATABASE_URL = process.env.DATABASE_URL
// require an explicit --no-dry-run flag to make changes; default is a safe dry run
const DRY_RUN = !process.argv.includes('--no-dry-run')

if (!PROJECT_R_STRIPE_API_KEY || !REPUBLIK_STRIPE_API_KEY || !DATABASE_URL) {
  console.log(
    'missing required env vars: STRIPE_SECRET_KEY_PROJECT_R, STRIPE_SECRET_KEY_REPUBLIK, DATABASE_URL',
  )
  process.exit(1)
}

const stripeAdapters: Record<string, Stripe> = {
  PROJECT_R: new Stripe(PROJECT_R_STRIPE_API_KEY),
  REPUBLIK: new Stripe(REPUBLIK_STRIPE_API_KEY),
}

async function main() {
  const pgdb = await PgDb.connect({ connectionString: DATABASE_URL })

  try {
    const staleUpgrades = await pgdb.payments.subscription_upgrades.find({
      status: 'registered',
      'scheduled_start <=': new Date(),
    })

    console.log(
      `found ${staleUpgrades.length} stale registered upgrade(s)${
        DRY_RUN ? ' [dry run]' : ''
      }`,
    )

    for (const upgrade of staleUpgrades) {
      const stripe = stripeAdapters[upgrade.company]
      if (!stripe) {
        console.log(
          `[skip] upgrade ${upgrade.id}: unknown company ${upgrade.company}`,
        )
        continue
      }
      if (!upgrade.external_id) {
        console.log(`[skip] upgrade ${upgrade.id}: no schedule external_id`)
        continue
      }

      const schedule = await stripe.subscriptionSchedules.retrieve(
        upgrade.external_id,
      )

      if (schedule.status === 'canceled') {
        console.log(
          `[skip] upgrade ${upgrade.id}: schedule ${schedule.id} was canceled; needs manual review`,
        )
        continue
      }

      const subscriptionId =
        typeof schedule.subscription === 'string'
          ? schedule.subscription
          : schedule.subscription?.id

      if (!subscriptionId) {
        console.log(
          `[skip] upgrade ${upgrade.id}: schedule ${schedule.id} has no resulting subscription yet`,
        )
        continue
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      if (subscription.status !== 'active') {
        console.log(
          `[skip] upgrade ${upgrade.id}: subscription ${subscription.id} not active (status: ${subscription.status})`,
        )
        continue
      }

      console.log(
        `[fix] upgrade ${upgrade.id}: releasing schedule ${schedule.id}, marking resolved`,
      )

      if (!DRY_RUN) {
        if (schedule.status !== 'released' && schedule.status !== 'completed') {
          await stripe.subscriptionSchedules.release(schedule.id)
        }
        await pgdb.payments.subscription_upgrades.updateOne(
          { id: upgrade.id },
          { status: 'resolved', updated_at: new Date() },
        )
      }
    }
  } finally {
    await pgdb.close()
  }
}

main()
