import { useState } from 'react'

import { css } from 'glamor'

import { Editorial, useColorContext } from '@project-r/styleguide'

import { ScrollySlide } from './ScrollySlide'
import { ChapterIndicator } from './ChapterIndicator'
import { StoryGraphic } from './StoryGraphicBanks'

export const Scrolly = () => {
  const [colorScheme] = useColorContext()
  const [inViewList, setInViewList] = useState([
    false,
    false,
    false,
    false,
    false,
  ])

  const handleInView = (idx: number) => (inView: boolean) => {
    setInViewList((v1) => {
      const v2 = [...v1]
      v2[idx] = inView
      return v2
    })
  }

  const lastInView = inViewList.lastIndexOf(true)

  return (
    <div className='Scrolly' {...styles.scrolly}>
      <div {...styles.scrollyGraphicsContainer}>
        <div
          {...styles.scrollyGraphicsChapters}
          {...colorScheme.set('background-color', 'default')}
          style={{ opacity: lastInView >= 0 ? 1 : 0 }}
        >
          <ChapterIndicator mini highlighted={lastInView === 0}>
            1
          </ChapterIndicator>
          <ChapterIndicator mini highlighted={lastInView === 1}>
            2
          </ChapterIndicator>
          <ChapterIndicator mini highlighted={lastInView === 2}>
            3
          </ChapterIndicator>
          <ChapterIndicator mini highlighted={lastInView === 3}>
            4
          </ChapterIndicator>
        </div>

        <StoryGraphic highlighted={lastInView} />
      </div>

      <ScrollySlide
        highlighted={lastInView === 0}
        onChangeInView={handleInView(0)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 0}>1</ChapterIndicator>
        </Editorial.Subhead>
        <Editorial.P>
          260’000 Franken lässt sich die UBS eine Vollzeitstelle im Schnitt
          kosten.
        </Editorial.P>
        <Editorial.P>
          Das ist überdurchschnittlich viel für eine Schweizer Bank.
        </Editorial.P>
        <Editorial.P>
          Auch die CS gab zuletzt viel Geld aus für ihr Personal: 180’000
          Franken. Das ist zwar deutlich weniger als die Erzrivalin, von der sie
          unlängst geschluckt wurde. Aber immer noch viel im Vergleich mit
          anderen Banken und Konzernen.
        </Editorial.P>
        <Editorial.P>
          Müssten die Löhne nicht endlich sinken, nachdem die CS übernommen
          werden musste und die UBS dafür Sicherheiten in Form von Steuergeldern
          erhielt?
        </Editorial.P>
        <Editorial.P>
          Die UBS widerspricht. Man brauche die besten Leute, um im globalen
          Wettbewerb zu bestehen. Die Löhne seien darum so hoch, um zu
          verhindern, dass die Talente in andere Industrien abwandern, sagte
          UBS-Konzernchef Sergio Ermotti einmal.
        </Editorial.P>
        <Editorial.P>
          Die Wissenschaft hat bisher keine Belege dafür gefunden, dass etwa
          Boni die Leistung steigern. Und wie sieht es beim Grundgehalt aus?
          Führen hohe Löhne zu einer besseren Performance?
        </Editorial.P>
        <Editorial.P>
          Holen die teuren Leute das beste für ihre Arbeitgeberinnen heraus?
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 1}
        onChangeInView={handleInView(1)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 1}>2</ChapterIndicator>
        </Editorial.Subhead>
        <Editorial.P>
          Bleiben wir auf dem Schweizer Finanzplatz und nehmen die
          Genossenschaftsbank Raiffeisen und die Kantonalbanken aus den Kantonen
          Waadt und Zug als Vergleich dazu.
        </Editorial.P>

        <Editorial.P>
          Zwar sind die Grössenunterschiede bei den Personalausgaben riesig. So
          meldet etwa die UBS mit 71’000 FTEs 172-mal mehr Vollzeitstellen als
          die Zuger Kantonalbank mit 416 FTE. Doch für den Vergleich spielt die
          Grösse keine Rolle, weil wir die Ausgaben auf eine Vollzeitstelle
          herunterbrechen.
        </Editorial.P>

        <Editorial.P>
          Hier zeigt sich, dass das Personal der Raiffeisen und der
          Kantonalbanken deutlich schlechter bezahlt wird, als jenes der UBS.
          Und die Personalkosten der Waadtländer Kantonalbank sind minim höher
          als bei der CS.
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 2}
        onChangeInView={handleInView(2)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 2}>3</ChapterIndicator>
        </Editorial.Subhead>
        <Editorial.P>
          Nun nehmen wir einen neuen Wert dazu: den Konzerngewinn pro
          Vollzeitstelle. Oder mit anderen Worten: die Effizienz.
        </Editorial.P>

        <Editorial.P>
          Auf einen Schlag ändert sich das Bild. Die UBS rutscht ab und die
          kleineren Banken mit dem vermeintlich weniger guten Personal schwingen
          obenauf. Zum Sonderfall CS kommen wir gleich.
        </Editorial.P>

        <Editorial.P>
          Was auffällt bei den Kantonalbanken: Hier ist der Wert «Gewinn pro
          Vollzeitstelle» sogar noch höher als «Kosten pro Vollzeitstelle». Das
          bedeutet, dass ihr Personal nicht nur seine Lohn- und Sozialkosten
          (via Umsatz) wieder reinholt, sondern darüber hinaus sogar mehr Gewinn
          erwirtschaftet als es Kosten verursacht.
        </Editorial.P>

        <Editorial.P>Und das führt uns zur CS.</Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 3}
        onChangeInView={handleInView(3)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 3}>4</ChapterIndicator>
        </Editorial.Subhead>
        <Editorial.P>
          Sie hat im Vergleichsjahr 2021 einen Verlust von 1,65 Milliarden
          Franken eingefahren. Damit fällt auch der Gewinn pro Person ins Minus.
        </Editorial.P>

        <Editorial.P>
          Die UBS steht schlechter da als Raiffeisen und Kantonalbanken und die
          CS findet sich im Keller wieder. Haben sich die hohen Ausgaben im
          globalen Gerangel um die besten Talente ausbezahlt?
        </Editorial.P>

        <Editorial.P>Zugegeben, das ist eine rhetorische Frage.</Editorial.P>
        <Editorial.P>
          Und es könnte mitunter der Verdacht aufkommen, dass hier ein Jahr
          gewählt wurde, das für die CS besonders schlecht war. Doch das Bild
          ändert sich auch in jenen Jahren nicht, welche die CS mit schwarzen
          Zahlen abgeschlossen hat. Man muss bis ins Jahr 2010 zurück, um einen
          Durchschnittswert zu finden, der mit den kleineren Banken mithalten
          kann.
        </Editorial.P>
        <Editorial.P>
          Mit anderen Worten: Viele Jahre hat die CS einen Haufen Geld für die
          angeblich besten Leute verschwendet.
        </Editorial.P>
        <Editorial.P>
          Ein grosser Teil dieses Geldes ist in Form von Bonuszahlungen für
          Kaderleute ausgegeben worden, die Risiken missachteten und persönliche
          Bereicherung über beruflichen Erfolg stellten.
        </Editorial.P>
      </ScrollySlide>
    </div>
  )
}

const styles = {
  scrolly: css({
    position: 'relative',
  }),
  scrollyGraphicsContainer: css({
    position: 'sticky',
    top: 0,
    /* min-height: 50dvh; */
    width: '100%',
    zIndex: 1,
    display: 'flex',
    height: '100%',
    // maxHeight: '35vh' /* don't use dvh here, otherwise the layout will jump when scrolling */,
    backdropFilter: 'blur(2px)',
    flexWrap: 'wrap',
  }),
  scrollyGraphicsChapters: css({
    width: '100%',
    textAlign: 'center',
    paddingTop: 80,
    opacity: 0,
  }),
}
