import { type NextReadsResult } from '../../lib/index'

export = {
  id: (self: NextReadsResult) => {
    return self.id
  },
  documents: async (self: NextReadsResult) => {
    return self.documents
  },
}
