import type { PgDb } from 'pogi'

export async function trackSignupRequest(
  pgdb: PgDb,
  newsletter: string,
  meta: Record<string, any>,
) {
  return pgdb.public.newsletter_signups.insertAndGet({
    newsletter,
    requested_at: new Date(),
    confirmed_at: null,
    meta,
  })
}

export async function confirmNewsletterSignupRequest(
  pgdb: PgDb,
  request_id: string,
  userId: string,
) {
  return pgdb.public.newsletter_signups.updateAndGet(request_id, {
    user_id: userId,
    confirmed_at: new Date(),
  })
}

export async function trackNewsletterSignup(
  pgdb: PgDb,
  userId: string,
  newsletter: string,
  meta?: Record<string, any>,
) {
  const now = new Date()

  return pgdb.public.newsletter_signups.insertAndGet({
    newsletter,
    user_id: userId,
    requested_at: now,
    confirmed_at: now,
    meta,
  })
}
