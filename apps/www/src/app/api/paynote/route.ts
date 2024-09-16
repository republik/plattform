import { PaynotesDocument } from '#graphql/cms/__generated__/gql/graphql'
import { Paynotes } from '@app/app/api/paynote/types'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { NextResponse } from 'next/server'

export const revalidate = 5

export async function GET(): Promise<NextResponse<Paynotes>> {
  const client = getCMSClient()

  const {
    data: {
      paynoteConfig: { paynotes, miniPaynotes },
    },
  } = await client.query({
    query: PaynotesDocument,
  })

  const paynote = paynotes[Math.round(Math.random() * (paynotes.length - 1))]

  const miniPaynote =
    miniPaynotes[Math.round(Math.random() * (miniPaynotes.length - 1))]

  return NextResponse.json({ paynote, miniPaynote })
}
