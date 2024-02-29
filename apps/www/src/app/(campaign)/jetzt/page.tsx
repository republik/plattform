import { InvalidCodeMessage } from '@app/app/(campaign)/components/invalid-code-message'
import { getMe } from '@app/lib/auth/me'
import { redirect } from 'next/navigation'

export default async function Page() {
  const me = await getMe()

  if (me) {
    return redirect('/jetzt-einladen')
  }

  return <InvalidCodeMessage />
}
