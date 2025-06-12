export type Author = {
  id: string
  firstName: string
  lastName: string
  bio: string
  publicUrls: JSON
  userId: string
  gender: string
  prolitterisId: string
  portraitUrl: string
  slug: string
}

export type ChangeAuthorArgs = {
  firstName: string
  lastName: string
  bio?: string
  publicUrls?: JSON
  userId?: string
  gender?: string
  prolitterisId?: string
  portraitUrl?: string
  slug?: string
}
