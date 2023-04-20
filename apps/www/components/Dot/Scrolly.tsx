import { useState } from 'react'

import { css } from 'glamor'

import { Editorial, useColorContext, mediaQueries } from '@project-r/styleguide'

import { ScrollySlide } from './ScrollySlide'
import { ChapterIndicator } from './ChapterIndicator'
import { StoryGraphic } from './StoryGraphicV2'

import { useResolvedColorSchemeKey } from '../ColorScheme/lib'
import { COLORS } from './config'

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
        {...colorScheme.set('background-color', 'default')}
      >
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
          <ChapterIndicator mini highlighted={lastInView === 4}>
            5
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
          Schwanger werden mit IVF - ein sensibles Thema
        </Editorial.Subhead>
        <Editorial.P>
          Unerfüllter Kinderwunsch ist ein intimes Thema, über das Paare selten
          offen sprechen. Wenn sie es aber tun, machen viele von ihnen die
          Erfahrung, dass eine künstliche Befruchtung als Königsweg angesehen
          wird. So, als müsste man einmal kurz in die Kinderwunschklinik und
          schwupps, sei der Nachwuchs unterwegs.
        </Editorial.P>
        <Editorial.P>
          Die Grafik zeigt eine Gruppe von
          <Highlight colorKey={key} color='default'>
            100 Frauen,
          </Highlight>
          die per In-Vitro-Fertilisation (IVF) schwanger werden wollen. Das
          Prozedere einer IVF ist auch für Frauen bis Mitte 30 strapaziös. Es
          stimmt aber, dass die Mehrheit von ihnen mit grosser
          Wahrscheinlichkeit nach einigen Embryonentransfers schwanger wird.
          Ähnlich wie bei der natürlichen Fruchtbarkeit steigt die
          Wahrscheinlichkeit einer Schwangerschaft bei mehreren Versuchen.
        </Editorial.P>
      </ScrollySlide>
      <ScrollySlide
        highlighted={lastInView === 1}
        onChangeInView={handleInView(1)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 1}>2</ChapterIndicator>
          Gute Chancen bis Mitte 30
        </Editorial.Subhead>
        <Editorial.P>
          Gesunde Paare ohne Einschränkungen der Fruchtbarkeit haben im Alter
          von rund 30 Jahren gut 25 Prozent Chancen pro Zyklus, schwanger zu
          werden. Das bedeutet, im Durchschnitt erwarten sie nach vier Monaten
          ein Kind.
        </Editorial.P>
        <Editorial.P>
          Mit IVF geht es sogar etwas schneller: Nach dem
          <Highlight colorKey={key} color='one100'>
            ersten Transfer
          </Highlight>
          sind laut Statistik gut 40 von 100 Frauen schwanger in der
          Altersgruppe bis 34 Jahre. Die Zahlen steigen schnell. Nach dem
          <Highlight colorKey={key} color='one300'>
            dritten Versuch
          </Highlight>
          konnten sich bereits gut zwei Drittel über einen positiven Test
          freuen. Nach
          <Highlight colorKey={key} color='one500'>
            mehr als vier IVF-Transfers
          </Highlight>
          erwartet die grosse Mehrheit der Frauen bis Mitte 30 ein Kind: Dann
          sind 82 von 100 Frauen schwanger.
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 2}
        onChangeInView={handleInView(2)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 2}>3</ChapterIndicator>
          Ende 30 wird es schwieriger
        </Editorial.Subhead>
        <Editorial.P>
          Es ist absurd, Frauen sorgen sich oft Jahrzehnte darum, wie sie am
          sichersten nicht schwanger werden. Und dann läuft es für einen Teil
          von ihnen so: Sie entscheiden sich gemeinsam mit ihrem Partner, ein
          Kind zu bekommen. Und es passiert nichts. Einen Monat lang. Drei.
          Zwölf.
        </Editorial.P>

        <Editorial.P>
          Als Unfruchtbarkeit definiert die World Health Organisation (WHO),
          wenn es durch regelmässigen ungeschützten Sex nach einem Jahr nicht
          zur Schwangerschaft gekommen ist. Gleichzeitig dauert es oft lange,
          bis Paare bei unerfülltem Kinderwunsch Hilfe bei einer
          Reproduktionsspezialistin suchen. Dabei empfiehlt die WHO Frauen ab
          Mitte 30 und ihren Partnern, sich bereits in Behandlung zu geben, wenn
          sie nach sechs Monaten nicht schwanger sind.
        </Editorial.P>

        <Editorial.P>Denn die Zeit läuft. Leider.</Editorial.P>

        <Editorial.P>
          Frauen im Alter von 35 bis 39 Jahren haben zwar noch ziemlich gute
          Chancen, mit IVF schwanger zu werden. Aber schon sichtbar schlechtere
          als noch ein paar Jahre zuvor. Die Statistik zeigt, dass nach dem
          <Highlight colorKey={key} color='two100'>
            ersten Transfer
          </Highlight>
          32 von 100 Enddreissigerinnen ein Kind erwarten. Nach dem
          <Highlight colorKey={key} color='two200'>
            zweiten Transfer
          </Highlight>
          ist es jede Zweite. Nach
          <Highlight colorKey={key} color='two500'>
            mehr als vier Transfers
          </Highlight>
          sind zwei Drittel der Kinderwunsch-Patientinnen schwanger.
        </Editorial.P>
        <Editorial.P>Das ist immer noch die Mehrheit.</Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 3}
        onChangeInView={handleInView(3)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 3}>4</ChapterIndicator>
          Jenseits der 40 – schwanger, aber kein Kind
        </Editorial.Subhead>
        <Editorial.P>
          Bei Paaren mit Kinderwunsch wird der weibliche Zyklus zum
          Teufelskreis.
        </Editorial.P>

        <Editorial.P>
          Zwei Wochen der Verdrängung. Normalität, vielleicht sogar mal ein Glas
          Wein.
        </Editorial.P>

        <Editorial.P>
          Die fruchtbaren Tage. Jetzt kommt es drauf an.
        </Editorial.P>

        <Editorial.P>Warten.</Editorial.P>
        <Editorial.P>Warten.</Editorial.P>
        <Editorial.P>Test. Negativ. Trauer, Wut, Verzweiflung.</Editorial.P>
        <Editorial.P>
          Wer Monat für Monat zittern und hadern musste, für den ist ein
          positiver Schwangerschaftstest ein Geschenk des Himmels. Hoffen
          dürfen.
        </Editorial.P>
        <Editorial.P>
          Dies bleibt Frauen jenseits der 40 und ihren Partnern auch mit allen
          Mitteln der Unterstützung oft verwehrt. Im Gegensatz zu den jüngeren
          Altersgruppen wird die Mehrheit von ihnen gar nicht mehr schwanger.
        </Editorial.P>
        <Editorial.P>
          Bei Frauen ab 40 erwarten nach dem
          <Highlight colorKey={key} color='three100'>
            ersten IVF-Transfer
          </Highlight>
          18 von 100 Frauen ein Kind. Nach
          <Highlight colorKey={key} color='three500'>
            mehr als vier Transfers
          </Highlight>
          steigt diese Zahl auf 35 von 100 Frauen an. Mehr ist nicht.
        </Editorial.P>
        <Editorial.P>
          Und noch dazu, leider, wächst mit jedem Jahr das Fehlgeburtsrisiko.
          Bereits mit 40 verliert mehr als jede dritte Frau ihr Kind wieder, in
          den allermeisten Fällen in der frühen Schwangerschaft. Im Alter von 44
          Jahren ist es jede Zweite.
        </Editorial.P>
        <Editorial.P>
          Was bleibt, ist Akzeptanz und Abschied vom Kinderwunsch. Oder die
          unerbittliche Hoffnung, die so gut zu verstehen ist.
        </Editorial.P>
        <Editorial.P>
          In Deutschland haben über einen Zeitraum von vier Jahren knapp 2500
          Frauen im Alter von 45 eine IVF oder eine ICSI versucht.
        </Editorial.P>
        <Editorial.P>65 von ihnen sind heute Mutter.</Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 4}
        onChangeInView={handleInView(4)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 4}>5</ChapterIndicator>
          Der Weg zum Kind
        </Editorial.Subhead>
        <Editorial.P>
          Halten Eltern glücklich ihr Baby auf dem Arm, sieht man ihnen den Weg
          nicht an, den sie für dieses Kind gegangen sind. Und sie haben dann
          guten Grund, viele der Mühen zu vergessen.
        </Editorial.P>

        <Editorial.P>
          Doch nicht ganz zu vergessen, ist wichtig. Und zwar auch dies: In der
          Schweiz ist es bereits ein Privileg, Unterstützung im Kinderwunsch
          suchen zu können. Denn dies hängt vom eigenen Portemonnaie ab. Anders
          als in vielen Ländern Europas werden die Kosten für eine IVF nicht von
          der Krankenkasse übernommen.
        </Editorial.P>

        <Editorial.P>
          Das bedeutet: Wer fünf IVF-Transfers braucht, hat an die 50’000
          Franken ausgegeben, um schwanger zu werden.
        </Editorial.P>
      </ScrollySlide>
    </div>
  )
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
        style={{ backgroundColor: COLORS[colorKey].lightBackground }}
      >
        <span
          {...styles.circle}
          style={{ backgroundColor: COLORS[colorKey][color] }}
        />
        {children}
      </span>
    </span>
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
      '45vh' /* don't use dvh here, otherwise the layout will jump when scrolling */,
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
    wordBreak: 'break-word',
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
