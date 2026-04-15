import { useState } from 'react'

export type OverlayState<T> = {
  data: T | null
  open: boolean
  setOpen: (open: boolean) => void
  handleOpen: (data?: T | null) => void
  handleClose: () => void
}

/**
 * Hook to handle the state of an overlay as well as data passed to it.
 */
function useOverlay<T>(): OverlayState<T> {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<T | null>(null)

  function handleOpen(data: T | null = null) {
    setData(data)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setData(null)
  }

  return {
    data,
    open,
    setOpen,
    handleOpen,
    handleClose,
  }
}

export default useOverlay
