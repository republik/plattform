export type MediaProgress = {
  id: string
  mediaId: string
  secs: number
  createdAt: string
  updatedAt: string
  collection: unknown // todo
  document?: unknown // todo
  max?: MediaProgress
}
