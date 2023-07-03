import { useState } from 'react'

import { css } from 'glamor'

import { Editorial, useColorContext, mediaQueries } from '@project-r/styleguide'

import { ScrollySlide } from './ScrollySlide'
import { ChapterIndicator } from './ChapterIndicator'
import { StoryGraphic } from './StoryGraphicBanks'

import { useResolvedColorSchemeKey } from '../ColorScheme/lib'
import { NEW_COLORS } from './config'

export const Scrolly = () => {
  const [colorScheme] = useColorContext()
  const key = useResolvedColorSchemeKey()
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
      <div
        {...styles.scrollyGraphicsContainer}
        {...colorScheme.set('backgroundColor', 'default')}
      >
        <div
          {...styles.scrollyGraphicsChapters}
          {...colorScheme.set('backgroundColor', 'default')}
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
          258’000 Franken lässt sich die
          <Highlight colorKey={key} color='one'>
            UBS
          </Highlight>
          eine Vollzeitstelle im Schnitt kosten.
        </Editorial.P>
        <Editorial.P>
          Das ist überdurchschnittlich viel für eine Schweizer Bank.
        </Editorial.P>
        <Editorial.P>
          Auch die
          <Highlight colorKey={key} color='two'>
            CS
          </Highlight>
          gab zuletzt viel Geld aus für ihr Personal: 179’000 Franken pro
          Vollzeitstelle (FTE). Das ist zwar deutlich weniger als die
          Erzrivalin, von der sie unlängst geschluckt wurde. Aber immer noch
          viel im Vergleich mit anderen Banken und Konzernen.
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
          Genossenschaftsbank
          <Highlight colorKey={key} color='four'>
            Raiffeisen
          </Highlight>
          und die Kantonalbanken aus den Kantonen
          <Highlight colorKey={key} color='five'>
            Waadt
          </Highlight>
          und
          <Highlight colorKey={key} color='three'>
            Zug
          </Highlight>
          als Vergleich dazu.
        </Editorial.P>

        <Editorial.P>
          Zwar sind die Grössenunterschiede bei den Personalausgaben riesig. Die
          UBS bezahlt 71’000 FTE und damit 172-mal mehr als die
          <Highlight colorKey={key} color='three'>
            Zuger Kantonalbank
          </Highlight>
          mit gerade mal 416 FTE. Doch für den Vergleich spielt die Grösse keine
          Rolle, weil wir die Ausgaben auf eine Vollzeitstelle herunterbrechen.
        </Editorial.P>

        <Editorial.P>
          Hier zeigt sich, dass das Personal der Raiffeisen und der
          Kantonalbanken deutlich schlechter bezahlt wird, als jenes der UBS.
          Die
          <Highlight colorKey={key} color='two'>
            CS
          </Highlight>
          reiht sich bei den Personalkosten im oberen Mittelfeld der kleineren
          Banken ein.
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
          Nun nehmen wir einen neuen Wert dazu: den Konzerngewinn pro FTE. Oder
          mit anderen Worten: die Effizienz. Wir sehen zum Beispiel, dass die
          <Highlight colorKey={key} color='five'>
            Waadtländer Kantonalbank
          </Highlight>
          pro Vollzeitstelle 196’000 Franken Gewinn macht, während die
          Personalausgaben bei 181’000 Franken liegen.
        </Editorial.P>

        <Editorial.P>
          Das ist ein hervorragendes Verhältnis. Es zeigt: Das Personal der
          kleinen Bank ist derart effizient, dass es nicht nur seine Lohn- und
          Sozialkosten (via Umsatz) wieder reinholt, sondern darüber hinaus
          sogar mehr Gewinn erwirtschaftet als es Kosten verursacht.
        </Editorial.P>

        <Editorial.P>
          Was auffällt bei den Kantonalbanken: Hier ist der Wert «Gewinn pro
          Vollzeitstelle» sogar noch höher als «Kosten pro Vollzeitstelle». Das
          bedeutet, dass ihr Personal nicht nur seine Lohn- und Sozialkosten
          (via Umsatz) wieder reinholt, sondern darüber hinaus sogar mehr Gewinn
          erwirtschaftet als es Kosten verursacht.
        </Editorial.P>
        <Editorial.P>
          Davon können die Banker bei der
          <Highlight colorKey={key} color='one'>
            UBS
          </Highlight>
          nur träumen. Sie sehen im Vergleich mit dem günstigeren Personal der
          Regionalbanken bleich aus.
        </Editorial.P>

        <Editorial.P>Und die CS?</Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 3}
        onChangeInView={handleInView(3)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 3}>4</ChapterIndicator>
        </Editorial.Subhead>
        <Editorial.P>
          Die
          <Highlight colorKey={key} color='two'>
            CS
          </Highlight>
          hat im Vergleichsjahr 2021 einen Verlust von 1.65 Milliarden Franken
          eingefahren. Damit fällt auch der Gewinn pro Person ins Minus. Konkret
          machte die Grossbank pro FTE einen Verlust von 32’900 Franken.
        </Editorial.P>

        <Editorial.P>
          Die Frage drängt sich auf, ob hier einfach ein Jahr ausgesucht wurde,
          das für die CS besonders schlecht lief. Doch das spielt keine Rolle.
          Es sieht für die CS auch in Jahren mit Schwarzen Zahlen nicht besser
          aus. Wir mussten bis ins Jahr 2010 zurück, um einen Durchschnittswert
          zu finden, der mit den kleineren Banken mithalten kann. Damals machte
          die CS einen Gewinn von 102’000 Franken pro FTE.
        </Editorial.P>
        <Editorial.P>
          Mit anderen Worten: Viele Jahre lang hat die CS für Vergütungen und
          Bonuszahlungen zuhanden der angeblich besten Leute einen Haufen Geld
          zum Fenster raus geworfen. Selbst die
          <Highlight colorKey={key} color='one'>
            UBS
          </Highlight>
          , die heute viel besser dasteht, hätte die Leistung womöglich
          günstiger haben können.
        </Editorial.P>
        <Editorial.P>
          Die schlechten Effizienzwerte zeigen, dass die Rechnung für die
          Grossbanken nicht aufgegangen ist.
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
    padding: '48px',
    /* min-height: 50dvh; */
    width: '100vw',
    // Beautiful hack to break out to full width from whatever the container size is at the moment
    marginLeft: 'calc(-50vw + 50%)',
    zIndex: 1,
    display: 'flex',
    maxHeight:
      '40vh' /* don't use dvh here, otherwise the layout will jump when scrolling */,
    backdropFilter: 'blur(2px)',
    boxShadow: '0px 5px 5px 0px rgba(0,0,0,0.05)',

    [mediaQueries.mUp]: {
      padding: '40px',
    },
  }),
  scrollyGraphicsChapters: css({
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 0,
    textAlign: 'center',
    justifyContent: 'center',
    opacity: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: 0,
  }),
  highlight: css({
    whiteSpace: 'nowrap',
    margin: '-1px 0 1px 0',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.3em',
    padding: '0.2em',
    lineHeight: '20px',
  }),
  circle: css({
    display: 'inline-block',
    borderRadius: '50%',
    width: '12px',
    height: '12px',
    marginRight: '5px',
  }),
}

const Highlight = ({ color, colorKey, children }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        verticalAlign: 'text-top',
        padding: '0 5px',
      }}
    >
      <span
        {...styles.highlight}
        style={{ backgroundColor: NEW_COLORS[colorKey].lightBackground }}
      >
        <span
          {...styles.circle}
          style={{ backgroundColor: NEW_COLORS[colorKey][color] }}
        />
        {children}
      </span>
    </span>
  )
}
