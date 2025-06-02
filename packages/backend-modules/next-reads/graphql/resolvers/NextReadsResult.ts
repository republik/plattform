import type { NextReadsResult } from '../../lib/index'

export = {
  id: (self: NextReadsResult) => {
    return self.id
  },
  documents: (self: NextReadsResult) => {
    return self.documents
  },
}
