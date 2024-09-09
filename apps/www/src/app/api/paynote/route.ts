import { PaynotesDocument } from '#graphql/cms/__generated__/gql/graphql'
import { Paynote } from '@app/app/api/paynote/types'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse<Paynote>> {
  const client = getCMSClient()

  const {
    data: { paynotes },
  } = await client.query({ query: PaynotesDocument })

  const randomPaynote =
    paynotes[Math.round(Math.random() * (paynotes.length - 1))]

  return NextResponse.json(randomPaynote)
}
