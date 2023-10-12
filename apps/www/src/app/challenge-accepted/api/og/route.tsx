import { ImageResponse } from 'next/server'

const CHALLENGE_ACCEPTED_SVG_URL =
  'https://www.datocms-assets.com/104239/1695397092-501_challenge-accepted.svg'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#EBEA2B',
        }}
      >
        <img
          src={CHALLENGE_ACCEPTED_SVG_URL}
          width='100% '
          height='80%'
          style={{
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
