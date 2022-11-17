const journalFormatSlug = 'republik/format-journal'
const journalQuery = `{documents(format:"${journalFormatSlug}",first:1){nodes{meta{path}}}}`

export async function getLatestJournalPath(): Promise<string | undefined> {
  const response = await fetch(`${process.env.API_URL}?query=${journalQuery}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Passing this header ensures we can bypass the membership check
      authorization: `DocumentApiKey ${process.env.SSG_DOCUMENTS_API_KEY}`,
    },
  })

  if (response.ok) {
    const { data } = await response.json()
    return data?.documents?.nodes?.[0]?.meta?.path
  }

  return undefined
}
