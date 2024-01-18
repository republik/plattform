import { UserInviterProfileInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { ImageResponse } from 'next/og'

export async function GET(
  request,
  {
    params,
  }: {
    params: { code: string }
  },
) {
  const { data } = await getClient().query({
    query: UserInviterProfileInfoDocument,
    variables: { accessToken: params.code },
  })

  // Font
  const druk = fetch(
    'https://cdn.repub.ch/s3/republik-assets/fonts/Druk-Medium-Web.woff',
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: '#F50000',
          color: '#FFFDF0',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          fontFamily: 'Druk',
          textAlign: 'center',
        }}
      >
        Einladung von {data.sender.firstName}
      </div>
    ),
    {
      width: 400,
      height: 800,
      fonts: [
        {
          name: 'Druk',
          data: await druk,
          style: 'normal',
          weight: 500,
        },
      ],
    },
  )
}
