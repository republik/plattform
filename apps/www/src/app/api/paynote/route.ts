import { PaynotesDocument } from '#graphql/cms/__generated__/gql/graphql'
import { Paynotes } from '@app/app/api/paynote/types'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { NextResponse } from 'next/server'

export const revalidate = 5

export async function GET(): Promise<NextResponse<Paynotes>> {
  const client = await getCMSClient()

  const {
    data: {
      paynoteConfig: { paynotes, miniPaynotes },
    },
  } = await client.query({
    query: PaynotesDocument,
  })

  const paynote = paynotes[Math.floor(Math.random() * paynotes.length)]

  const miniPaynote =
    miniPaynotes[Math.floor(Math.random() * miniPaynotes.length)]

  return NextResponse.json({ paynote, miniPaynote })
}
