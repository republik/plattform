import { draftMode } from 'next/headers'

export async function GET() {
  const dm = await draftMode()
  dm.disable()
  return new Response('Draft mode is disabled')
}
