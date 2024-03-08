import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import { CTA } from '@app/app/(campaign)/jetzt/call-to-action'
import { css } from '@app/styled-system/css'
import { Metadata } from 'next'
import Image from 'next/image'

const portraitBoas =
  'https://cdn.repub.ch/s3/republik-assets/portraits/daf16ee05230c244c5646a48a633d333.jpeg?size=3738x3738&resize=384x384&bw=1&format=auto'
const portraitBrigitte =
  'https://cdn.repub.ch/s3/republik-assets/portraits/d328ba8aa21a8c0f031fa9c7de33efe3.jpeg?size=2000x1125&resize=384x384&bw=1&format=auto'

export const metadata: Metadata = {
  title: `Brigitte Hürlimann und Boas Ruh laden Sie ein, die Republik mit einem Abo zu unterstützen.`,
}

export default async function Page() {
  return (
    <>
      <h1
        className={css({
          textStyle: 'campaignHeading',
          pr: '16',
        })}
      >
        <TypewriterContent external />
      </h1>
      <div
        className={css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '8',
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'row',
            gap: '4',
            alignItems: 'center',

            // maxW: 600,
          })}
        >
          <div
            className={css({
              flexShrink: 0,
              position: 'relative',
              gap: '2',
              width: '7rem',
              height: '7rem',
            })}
          >
            <Image
              className={css({
                borderRadius: '4px',

                boxShadow: 'sm',
                height: '4rem',
                width: '4rem',

                position: 'absolute',
                top: '3rem',
                left: '3rem',
              })}
              alt='Portrait Boas Ruh'
              src={portraitBoas}
              width={96}
              height={96}
              unoptimized
            />
            <Image
              className={css({
                borderRadius: '4px',

                boxShadow: 'sm',
                height: '4rem',
                width: '4rem',
                position: 'relative',
              })}
              alt='Portrait Brigitte Hürlimann'
              src={portraitBrigitte}
              width={96}
              height={96}
              unoptimized
            />
          </div>
          <div
            className={css({
              flex: '0 1 auto',
              fontSize: { base: 'xl', md: '2xl' },
              textWrap: 'balance',
              '& em': {
                textStyle: 'sansSerifBold',
              },
            })}
          >
            <p>
              <em>Brigitte Hürlimann</em> und <em>Boas Ruh</em> laden Sie ein,
              die Republik mit einem Abo zu unterstützen.
            </p>
          </div>
        </div>

        <p>
          Hören Sie für ein ganzes Jahr von Montag bis Samstag alle Beiträge der
          Republik. Dazu gehören die Beiträge unserer Gerichtsreporterinnen. Sie
          berichten regelmässig aus dem Gerichtssaal. Ausserdem bringen wir
          Ihnen fundierte Recherchen, Reportagen, Analysen und Kolumnen aus
          Politik, Wirtschaft, Gesellschaft und Kultur.
        </p>

        <p>
          Die Republik ist unabhängig und werbefrei – finanziert von den
          Leserinnen und Hörern.
        </p>

        <p>
          Wir nehmen uns die nötige Zeit, um aktuelle Themen und Fragen für Sie
          angemessen und sorgfältig zu recherchieren, zu erzählen – und alle
          Fakten zu überprüfen.
        </p>
        <p>
          Damit Sie einen klaren Kopf behalten, mutig handeln und klug
          entscheiden können.
        </p>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
          })}
        >
          <h2
            className={css({
              fontWeight: 'bold',
            })}
          >
            Warum bestehende Abonnenten die Republik unterstützen:
          </h2>
          <ul
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '2',
              '&> li::before': {
                content: '"«"',
              },
              '&> li::after': {
                content: '"»"',
              },
            })}
          >
            <li>
              Die Beiträge helfen mir immer wieder, das chaotische Weltgeschehen
              besser einzuordnen, und unterstützen mich bei der Meinungsbildung.
            </li>
            <li>
              Unabhängiger Journalismus ist unter Druck. Es braucht Gegensteuer.
            </li>
            <li>
              Super Mischung aus Reportagen mit grossem Aktualitätsbezug, tolle
              Qualität und mutige neue Projekte wie das Klimalabor.
            </li>
            <li>
              Journalismus kostet. Und guten Journalismus will ich unterstützen.
            </li>
          </ul>
        </div>
        <CTA href='/jetzt/angebot' />
      </div>
    </>
  )
}
