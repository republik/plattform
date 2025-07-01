/* eslint-disable @next/next/no-img-element */
import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

const CHALLENGE_ACCEPTED_SVG_URL =
  'https://www.datocms-assets.com/104239/1695397092-501_challenge-accepted.svg'

export const runtime = 'edge'

// Image generation
export async function GET(_: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const res = await fetch(process.env.DATO_CMS_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `${process.env.DATO_CMS_API_TOKEN}`,
      // forbid invalid content to allow strict type checking
      'X-Exclude-Invalid': 'true',
    },
    body: JSON.stringify({
      query: `
        query PersonImage($slug: String!) {
          person: challengeAcceptedPerson(filter: {slug: {eq: $slug}}) {
            name
            portrait {
              url
              width
              height
            }
          }
        }
      `,
      variables: { slug: params.slug },
    }),
  }).then((res) => res.json())

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 50px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#EBEA2B',
          position: 'absolute',
        }}
      >
        <img
          src={CHALLENGE_ACCEPTED_SVG_URL}
          width='50%'
          height='80%'
          style={{
            objectFit: 'contain',
          }}
        />
        <img
          src={res.data.person.portrait.url}
          width='50%'
          height='90%'
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
