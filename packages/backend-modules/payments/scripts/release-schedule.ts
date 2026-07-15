import Stripe from 'stripe'

const PROJECT_R_STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY_PROJECT_R

if (PROJECT_R_STRIPE_API_KEY === undefined) {
  console.log('STRIPE KEYS missing')
  process.exit(1)
}

const ProjectRStripe = new Stripe(PROJECT_R_STRIPE_API_KEY)

async function main() {
  const scheduleArg = process.argv.find((arg) => arg.startsWith('--schedule='))
  const scheduleId = scheduleArg?.split('=')[1]

  if (scheduleId === undefined) {
    console.log('usage: release-schedule.ts --schedule=<schedule_id>')
    process.exit(1)
  }

  try {
    const schedule = await ProjectRStripe.subscriptionSchedules.release(
      scheduleId,
    )

    console.log(schedule)
  } catch (e) {
    if (e instanceof Stripe.errors.StripeInvalidRequestError && e.code === 'resource_missing') {
      console.log(`schedule ${scheduleId} does not exist on Stripe; skipping`)
      return
    }
    throw e
  }
}

main()
