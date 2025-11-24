import { css } from '@republik/theme/css'
import { PlusCircle } from 'lucide-react'
import OnboardingHeader from './onboarding-header'

function NextReads() {
  return (
    <div className={css({ p: 6 })}>
      <OnboardingHeader>
        <h2>Tipp 1 von 2</h2>
        <h1>Lassen Sie sich die Republik ins Postfach liefern</h1>
        <p>Welche Newsletter möchten Sie erhalten?</p>
      </OnboardingHeader>

      <div className={css({ py: 4, textAlign: 'center' })}>
        <h3
          className={css({
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'bold',
            mb: 4,
          })}
        >
          Beliebteste
        </h3>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          })}
        >
          <div
            className={css({
              display: 'flex',
              gap: 2,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'divider',
              p: 2,
            })}
          >
            <img
              className={css({
                flex: '0 0 1',
                alignSelf: 'flex-start',
                pt: 1,
              })}
              width='42'
              src='https://cdn.repub.ch/s3/republik-assets/repos/republik/wdwww-21-nov/images/93bddbde7caa064aab732fe6c42d474abab7a962.png?size=1890x945&format=auto&resize=768x'
              alt='newletter icon'
            />
            <div className={css({ textAlign: 'left' })}>
              <h4
                className={css({ textStyle: 'sansSerifMedium', fontSize: 'l' })}
              >
                Republik Heute
              </h4>
              <p className={css({ lineHeight: '1.2', mb: 1 })}>
                Jeden Morgen die kompakte Übersicht: Was die Republik aktuell zu
                bieten hat.
              </p>
              <p className={css({ color: 'textSoft' })}>Montag bis Freitag</p>
            </div>
            <button
              className={css({
                flex: '0 0 1',
                alignSelf: 'flex-start',
                pt: 1,
                pr: 1,
              })}
            >
              <PlusCircle />
            </button>
          </div>
          <div
            className={css({
              display: 'flex',
              gap: 2,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'divider',
              p: 2,
            })}
          >
            <img
              className={css({
                flex: '0 0 1',
                alignSelf: 'flex-start',
                pt: 1,
              })}
              width='42'
              src='https://cdn.repub.ch/s3/republik-assets/repos/republik/wdwww-21-nov/images/93bddbde7caa064aab732fe6c42d474abab7a962.png?size=1890x945&format=auto&resize=768x'
              alt='newletter icon'
            />
            <div className={css({ textAlign: 'left' })}>
              <h4
                className={css({ textStyle: 'sansSerifMedium', fontSize: 'l' })}
              >
                Republik Heute
              </h4>
              <p className={css({ lineHeight: '1.2', mb: 1 })}>
                Jeden Morgen die kompakte Übersicht: Was die Republik aktuell zu
                bieten hat.
              </p>
              <p className={css({ color: 'textSoft' })}>Montag bis Freitag</p>
            </div>
            <button
              className={css({
                flex: '0 0 1',
                alignSelf: 'flex-start',
                pt: 1,
                pr: 1,
              })}
            >
              <PlusCircle />
            </button>
          </div>
        </div>
      </div>

      <div className={css({ py: 4, textAlign: 'center' })}>
        <h3
          className={css({
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'bold',
            mb: 4,
          })}
        >
          Was für Sie?
        </h3>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          })}
        >
          <div
            className={css({
              display: 'flex',
              gap: 2,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'divider',
              p: 2,
            })}
          >
            <img
              className={css({
                flex: '0 0 1',
                alignSelf: 'flex-start',
                pt: 1,
              })}
              width='42'
              src='https://cdn.repub.ch/s3/republik-assets/repos/republik/wdwww-21-nov/images/93bddbde7caa064aab732fe6c42d474abab7a962.png?size=1890x945&format=auto&resize=768x'
              alt='newletter icon'
            />
            <div className={css({ textAlign: 'left' })}>
              <h4
                className={css({ textStyle: 'sansSerifMedium', fontSize: 'l' })}
              >
                Republik Heute
              </h4>
              <p className={css({ lineHeight: '1.2', mb: 1 })}>
                Jeden Morgen die kompakte Übersicht: Was die Republik aktuell zu
                bieten hat.
              </p>
              <p className={css({ color: 'textSoft' })}>Montag bis Freitag</p>
            </div>
            <button
              className={css({
                flex: '0 0 1',
                alignSelf: 'flex-start',
                pt: 1,
                pr: 1,
              })}
            >
              <PlusCircle />
            </button>
          </div>
          <div
            className={css({
              display: 'flex',
              gap: 2,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'divider',
              p: 2,
            })}
          >
            <img
              className={css({
                flex: '0 0 1',
                alignSelf: 'flex-start',
                pt: 1,
              })}
              width='42'
              src='https://cdn.repub.ch/s3/republik-assets/repos/republik/wdwww-21-nov/images/93bddbde7caa064aab732fe6c42d474abab7a962.png?size=1890x945&format=auto&resize=768x'
              alt='newletter icon'
            />
            <div className={css({ textAlign: 'left' })}>
              <h4
                className={css({ textStyle: 'sansSerifMedium', fontSize: 'l' })}
              >
                Republik Heute
              </h4>
              <p className={css({ lineHeight: '1.2', mb: 1 })}>
                Jeden Morgen die kompakte Übersicht: Was die Republik aktuell zu
                bieten hat.
              </p>
              <p className={css({ color: 'textSoft' })}>Montag bis Freitag</p>
            </div>
            <button
              className={css({
                flex: '0 0 1',
                alignSelf: 'flex-start',
                pt: 1,
                pr: 1,
              })}
            >
              <PlusCircle />
            </button>
          </div>
        </div>
      </div>

      <div>
        <p>Ändern im Konto jederzeit möglich.</p>
        <button>Weiter</button>
      </div>
    </div>
  )
}

export default NextReads
