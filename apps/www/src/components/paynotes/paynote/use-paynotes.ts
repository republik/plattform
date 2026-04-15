import { Paynotes } from '@app/app/api/paynote/types'
import { useEffect, useState } from 'react'

export const usePaynoteVariants = () => {
  const [paynote, setPaynote] = useState<Paynotes | undefined>()

  useEffect(() => {
    if (!paynote) {
      fetch('/api/paynote')
        .then((res) => res.json())
        .then((pn: Paynotes) => setPaynote(pn))
    }
  }, [paynote])

  return paynote
}
