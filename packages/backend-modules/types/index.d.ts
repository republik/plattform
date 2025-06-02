import { PgDb } from 'pogi'

declare const __brand: unique symbol
type Brand<B> = { [__brand]: B }

export type Branded<T, B> = T & Brand<B>

export interface ConnectionContext {
  elastic: any
  pgdb: PgDb
  redis: any
  pubsub: any
}
export interface GraphqlContext extends ConnectionContext {
  t: any
  signInHooks: any
  mail: any
  scope?: 'request' | 'socket' | 'middleware' | 'scheduler'
  loaders: any
  user?: any
}

/**
 * @deprecated Use `ConnectionContext` instead
 */
export type Context = GraphqlContext

export interface UserRow {
  id: string
  username: string
  firstName: string
  lastName: string
  name: string
  initials: string
  hasPublicProfile: boolean
  roles: string[]
  email: string
  referralCode: string | null
  verified: boolean
  phoneNumber: string
  addressId: string | null
  portraitUrl: string | null
  statement: string | null
  isListed: boolean
  isAdminUnlisted: boolean
  testimonialId: string | null
  profileUrls: JSON
  badges: string[] | null
  biography: string | null
  pgpPublicKey: string | null
  phoneNumberNote: string | null
  phoneNumberAccessRole: string
  emailAccessRole: string
  ageAccessRole: string
  previewsSentAt: any | null
  adminNotes: string | null
  defaultDiscussionNotificationOption: string
  discussionNotificationChannels: string[]
  enabledSecondFactors: string[] | null
  deletedAt: Date | null
  preferredFirstFactor: string | null
  hadDevice: boolean
  disclosures: string
  accessKey: string
  gender: string | null
  prolitterisId: string | null
  birthyear: number | null
}

export interface User {
  id: string
  username: string
  slug: string
  firstName: string
  lastName: string
  name: string
  initials: string
  hasPublicProfile: boolean
  // api read access protected by a resolver functions
  roles: string[]
  email: string
  referralCode: string | null
  // use resolver functions to access _raw
  // and expose more fields according to custom logic
  _raw: UserRow
  [key: string]: any
}
