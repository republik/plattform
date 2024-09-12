import { Paynote } from '@app/app/api/paynote/types'
import { useEffect, useState } from 'react'

export const usePaynote = () => {
  const [paynote, setPaynote] = useState<Paynote | undefined>()

  useEffect(() => {
    if (!paynote) {
      fetch('/api/paynote')
        .then((res) => res.json())
        .then((pn: Paynote) => setPaynote(pn))
    }
  }, [paynote])

  return paynote
}
