export = {
  id: (self: { id: string }) => {
    return self.id
  },
  documents: async (self: { documents: { id: string; type?: string }[] }) => {
    return self.documents
  },
}
