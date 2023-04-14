import {
  Center,
  Editorial,
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
} from '@project-r/styleguide'
import Frame from '../Frame'
import { Scrolly } from './Scrolly'
import { Scrolly as ScrollyBanks } from './ScrollyBanks'

export const DotAppPrototyp1 = () => {
  return (
    <Frame>
      <Center>
        <div>
          <Editorial.Headline>
            Künstliche Befruchtung wird überschätzt
          </Editorial.Headline>
          <Editorial.Lead>
            Die Befruchtung in der Petrischale bedeutet grosse Hoffnung für
            Paare mit unerfülltem Kinderwunsch. Aber bei Frauen ab Mitte 30 wird
            eine Schwangerschaft auch mit In-Vitro-Fertilisation
            unwahrscheinlicher.
          </Editorial.Lead>
          <p className='byline'>
            Von Karen Merkel und Felix Michel, 13.04.2023
          </p>
        </div>
        <Scrolly />
        <section className='content' style={{ minHeight: '100vh' }}>
          <InfoBox>
            <InfoBoxTitle>Zu den Daten</InfoBoxTitle>

            <InfoBoxText>
              Diese Grafik basiert auf den Daten, die das Deutsche IVF-Register
              im Jahrbuch 2021 publiziert hat. Das DIR hat zum zweiten Mal die
              kumulative Schwangerschaftsrate bei allen In-vitro-Fertilisationen
              in Deutschland über zwei Jahre berechnet (2018-2020). Diese zeigt,
              wie viele Schwangerschaften nach einer oder mehreren IVF
              entstanden sind.
              <br />
              <br />
              Enthalten sind dabei die klassischen IVF-Verfahren, also
              diejenigen, bei denen die Eizelle und Spermien in der Petrischale
              zusammengebracht werden. Ausserdem alle Befruchtungen, bei denen
              gezielt ein Spermium in eine Eizelle gepflanzt wurde
              (Intrazytoplasmatische Spermieninjektion oder ISCI).
              <br />
              <br />
              Ausserdem ist relevant, dass hier die künstlichen Befruchtungen
              abgebildet sind, bei denen die Eizellen bei der Mutter frisch
              entnommen und nach einer kurzen Entwicklungszeit in die
              Gebärmutter transferiert wurden. Zudem alle, bei denen die
              befruchteten Eizellen zwischenzeitlich eingefroren waren,
              aufgetaut und dann transferiert wurden (Auftau- oder Kyrozyklen).
            </InfoBoxText>
          </InfoBox>
        </section>
      </Center>
    </Frame>
  )
}

export const DotAppPrototyp2 = () => {
  return (
    <Frame>
      <Center>
        <div>
          <Editorial.Headline>Die Besten</Editorial.Headline>
          <Editorial.Lead>
            Mit dem Untergang der Credit Suisse und der Geburt der Monster-UBS
            stellt sich die Frage: Führen hohe Löhne zu mehr Leistung?
          </Editorial.Lead>
          <p className='byline'>
            Von Philipp Albrecht und Felix Michel, 06.04.2023
          </p>
        </div>
        <ScrollyBanks />
        <section className='content' style={{ minHeight: '100vh' }}>
          <InfoBox>
            <InfoBoxTitle>Zu den Daten</InfoBoxTitle>

            <InfoBoxText>
              Den Gewinn, die Anzahl Vollzeitstellen (FTE) und den
              Personalaufwand weisen die Banken jeweils in ihren Jahresberichten
              aus. Den Aufwand pro FTE und den Gewinn pro FTE ergeben sich aus
              diesen Zahlen.
            </InfoBoxText>
          </InfoBox>
        </section>
      </Center>
    </Frame>
  )
}
