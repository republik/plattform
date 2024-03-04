/* eslint-disable @next/next/no-img-element */

import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { ImageResponse } from 'next/og'
import illustration from '@app/app/(campaign)/assets/campaign-illustration-inverted.svg'

const ILLUSTRATION_ASPECT_RATIO = illustration.width / illustration.height

const colors = {
  red: '#E50146',
  yellow: '#FFFDF0',
}
const size = (x: number) => x * 12

const sizes = {
  '0.5': size(0.5),
  1: size(1),
  2: size(2),
  3: size(3),
  4: size(4),
  5: size(5),
  6: size(6),
  7: size(7),
  8: size(8),
  12: size(12),
  16: size(16),
  32: size(32),
  64: size(64),
} as const

const Message = ({
  lines,
  portrait,
  orientation,
}: {
  lines: string[]
  portrait?: string
  orientation: 'landscape' | 'portrait'
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: orientation === 'landscape' ? 0 : sizes['6'],

        fontFamily: 'GTAmerica',
        fontSize: orientation === 'landscape' ? sizes['6'] : sizes['7'],
        fontWeight: 700,

        alignItems: 'center',
        textAlign: 'center',

        lineHeight: 1.2,
        whiteSpace: 'balance',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {portrait && (
        <img
          alt=''
          src={portrait}
          width={size(16)}
          height={size(16)}
          style={{
            borderRadius: sizes['1'],
            // border: `${4}px solid ${colors.yellow}`,
          }}
        ></img>
      )}
    </div>
  )
}

const Illustration = ({ size }: { size: number }) => {
  const src = new URL(illustration.src, process.env.NEXT_PUBLIC_BASE_URL)

  return (
    <img
      style={{
        height: size,
        width: size * ILLUSTRATION_ASPECT_RATIO,
        // marginBottom: sizes['4'],
      }}
      src={src.toString()}
      alt=''
    />
  )
}

const Logo = () => {
  return (
    <svg
      viewBox='0 0 925.115 136.781'
      style={{
        // width: sizes['12'],
        width: (sizes['4'] / 137) * 925,
        height: sizes['4'],
        fill: colors.yellow,
      }}
    >
      <path
        style={{ fill: colors.yellow }}
        d={
          'M721.463 133.73v-4.7l11.6-6.24 2.26-4.6V22.735l-2.26-4.6-11.6-6.238v-4.7h62.818v4.7l-11.6 6.238-2.438 4.6v95.457l2.44 4.6 11.6 6.24v4.7h-62.82zM424.22 136.78c34.81 0 46.53-20.452 46.53-46.696V26.59l2.438-4.6 17.783-10.094v-4.7h-51.005v4.7l17.963 10.095 2.26 4.6v63.132c0 23.71-10.033 34.027-25.08 34.027-15.55 0-24.078-11.403-24.078-34.753l.002-66.262 2.44-4.6 11.6-6.24v-4.7h-62.82v4.7l11.6 6.24 2.26 4.6V89.54c0 33.305 18.02 47.24 48.107 47.24zM715.02 87.195l-28.378 36.894h-23.156V22.733l2.442-4.6 11.597-6.24v-4.7H614.71v4.7l11.6 6.24 2.258 4.6v95.457l-2.26 4.6-11.6 6.24v4.7h98.6l6.415-46.535M309.033 7.208l-.012-.013h-59.817v4.7l11.6 6.238 2.26 4.6v95.458l-2.26 4.6-11.6 6.24v4.7h62.817v-4.7l-11.6-6.24-2.44-4.6V86.456l5.496-4.836 19.513 7.26c21.39-2.392 40.19-19.536 40.19-39.93 0-28.612-22.613-41.47-54.147-41.742zm-3.012 68.08h-8.04V24.324l13.608-9.857c8.34 2.882 14.27 11.627 14.27 29.56 0 22.694-11.044 31.263-19.837 31.263zM233.688 87.193l-28.71 36.896h-26.224V73.983h11.035l4.4 3.65 10.2 16.22h5v-49.2h-5l-10.2 16.22-4.4 3.65h-11.036V25.97l12.73-9.136h12.03l28.024 34.896h4.983L229.19 0h-5.213l-5.788 7.195h-88.214v4.7l11.6 6.24 2.26 4.6v95.456l-2.26 4.6-10.184 6.24v4.7h100.163l7.117-46.537M913.52 122.79L875.7 50.81l34.8-34.314 9.282-4.6v-4.7H874.5v30.59l-24.884 24.382h-6.826V22.732l2.44-4.6 11.6-6.24v-4.7H794.01v4.7l11.6 6.24 2.26 4.6v95.46l-2.26 4.6-11.6 6.237v4.7h62.817v-4.7l-11.6-6.24-2.44-4.6V83.26l5.61-5.534 30.407 56.004h46.31v-4.7M115.67 122.79L95.395 79.423c-15.315.61-28.903-2.24-28.903-2.24V75c24.693-4.342 47.487-12.46 47.487-34.276 0-27.613-25.178-33.396-54.154-33.525l-.006-.005H.003v4.7l11.6 6.24 2.26 4.6v95.456l-2.26 4.6-11.6 6.24v4.7H62.82v-4.7l-11.6-6.24-2.44-4.6V87.965l10.07-8.575 22.035 54.34h46.382v-4.7l-11.598-6.24zM62.302 14.52c8.184 1.527 14.354 8.963 14.354 27.578 0 21.176-8.315 27.912-21.948 27.912h-5.93V24.266l13.523-9.747zM568.615 69.232v-2.136c22.137-4.47 36.877-13.75 36.877-30.26 0-18.82-16.657-29.642-45.396-29.642h-66.903v4.7l11.6 6.24 2.26 4.6v95.456l-2.26 4.6-11.6 6.24v4.7h68.4c26.272-.708 47.42-10.087 47.42-33.62 0-21.525-17.542-28.874-40.398-30.878zM555.74 14.34c7.565 2.452 13.404 9.734 13.404 25.316 0 19.984-8.392 26.342-21.886 26.342h-5.288V24.266l13.77-9.927zm-7.75 109.75h-6.02V83.983l14.292-10.232c10.236 2.52 16.403 9.83 16.403 25.322 0 20.04-9.634 25.015-24.676 25.015z'
        }
      />
    </svg>
  )
}

export async function generateShareImage({
  code,
  showPortrait,
  orientation = 'portrait',
}: {
  code: string
  showPortrait?: boolean
  orientation?: 'portrait' | 'landscape'
}) {
  const [width, height] =
    orientation === 'portrait' ? [1080, 1920] : [1920, 1080]

  const data = await getInviteeData({ code })

  const sender = data?.sender

  // Font
  const [druk, gtAmerica, gtAmericaBold] = await Promise.all([
    fetch(
      'https://cdn.repub.ch/s3/republik-assets/fonts/Druk-Medium-Web.woff',
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-medium.woff',
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-bold.woff',
    ).then((res) => res.arrayBuffer()),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          background: colors.red,
          color: colors.yellow,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: sizes['8'],
        }}
      >
        <Illustration size={orientation === 'landscape' ? 200 : 240} />

        <Message
          lines={[
            // eslint-disable-next-line no-irregular-whitespace
            `Unabhängiger Journalismus lebt vom Einsatz vieler. Darum unterstütze ich die Republik.`,
            `Du auch?`,
          ]}
          portrait={showPortrait ? sender?.portrait : null}
          orientation={orientation}
        />

        <div style={{ display: 'flex', gap: sizes['4'] }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: sizes['4'],
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'GTAmerica',
                fontSize: sizes['4'],
                fontWeight: 500,
              }}
            >
              Jetzt zum Einstiegspreis
              ab&nbsp;CHF&nbsp;120&nbsp;für&nbsp;ein&nbsp;Jahr
            </div>
            <div style={{ display: 'flex' }}>
              <div
                style={{
                  fontFamily: 'GTAmerica',
                  fontSize: sizes['4'],
                  color: colors.red,
                  background: colors.yellow,
                  padding: sizes['2'],
                  paddingLeft: sizes['3'],
                  paddingRight: sizes['3'],
                  borderRadius: sizes['1'],
                }}
              >
                {`republik.ch/jetzt/${sender?.username ?? code}`}
              </div>
            </div>

            <Logo />
          </div>
        </div>
      </div>
    ),
    {
      // debug: true,
      width,
      height,
      fonts: [
        {
          name: 'Druk',
          data: druk,
          style: 'normal',
          weight: 500,
        },
        {
          name: 'GTAmerica',
          data: gtAmerica,
          style: 'normal',
          weight: 500,
        },
        {
          name: 'GTAmerica',
          data: gtAmericaBold,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  )
}
