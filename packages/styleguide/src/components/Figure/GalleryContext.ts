import { createContext } from 'react'

export const GalleryContext = createContext<{
  toggleGallery: (nextSrc?: string) => void
}>({
  toggleGallery: () => {},
})
