import { useState } from 'react'

import { css } from 'glamor'

import { Editorial, useColorContext } from '@project-r/styleguide'

import { ScrollySlide } from './ScrollySlide'
import { ChapterIndicator } from './ChapterIndicator'
import { StoryGraphic } from './StoryGraphic'

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
          Hoffnung sprengt jede Statistik
        </Editorial.Subhead>
        <Editorial.P>
          Es ist absurd: Frauen sorgen sich oft Jahrzehnte darum, wie sie am
          sichersten nicht schwanger werden. Und dann läuft es für einen Teil
          von ihnen so: Sie entscheiden sich gemeinsam mit ihrem Partner, ein
          Kind zu bekommen. Und es passiert: nichts. Einen Monat lang. Drei.
          Zwölf.
        </Editorial.P>
        <Editorial.P>
          Wenn der Kinderwunsch unerfüllt bleibt, dauert es – manchmal Jahre –
          bis Paare Hilfe in einem Kinderwunschzentrum suchen. Dann sitzen sie
          ihrer Reproduktionsmedizinerin gegenüber und hören Prozentzahlen.
          Wahrscheinlichkeiten.
        </Editorial.P>
        <Editorial.P>
          10 Prozent Wahrscheinlichkeit pro Zyklus, schwanger zu werden. 5
          Prozent. 2 Prozent. Hoffnung auf Besserung verspricht, wenn sie das
          gesamte Prozedere der In-Vitro-Fertilisation (IVF) absolvieren mit
          täglichen Hormonspritzen, Medikamenten, Eizellentnahme unter Narkose,
          Sperma-Abgabe, Einpflanzen der befruchteten Eizelle in die
          Gebärmutter.
        </Editorial.P>
        <Editorial.P>Dann bleibt, zu hoffen.</Editorial.P>
        <Editorial.P>
          Hoffnung lässt sich nicht von Berechnungen eingrenzen. Und das ist
          auch gut so. Nichtsdestotrotz kann ein Blick auf die Zahlen helfen,
          mehr zu verstehen.
        </Editorial.P>
        <Editorial.P>
          Unsere Grafik zeigt, wie gross die Wahrscheinlichkeit einer
          Schwangerschaft nach einer künstlichen Befruchtung per IVF ist. Und
          zwar kumuliert über mehrere IVF-Transfers hinweg, unterschieden nach
          Altersgruppen.
        </Editorial.P>
        <Editorial.P>
          Das bedeutet: Nach dem ersten IVF-Transfer sind um die{' '}
          <Highlight colorKey={key} color='two'>
            40 von 100 Frauen
          </Highlight>
          in der Altersgruppe bis Mitte 30 schwanger.
        </Editorial.P>
        <Editorial.P>
          Bei Frauen bis Ende 30 ist nach dem ersten Versuch rund jede dritte
          Frau schwanger (
          <Highlight colorKey={key} color='three'>
            32 von 100
          </Highlight>
          ).
        </Editorial.P>
        <Editorial.P>
          Ab einem Alter von 40 Jahren wird nach einem IVF-Transfer weniger als
          jede fünfte Frau schwanger (
          <Highlight colorKey={key} color='four'>
            18 von 100
          </Highlight>
          ).
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 1}
        onChangeInView={handleInView(1)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 1}>2</ChapterIndicator>
          Die realen Chancen
        </Editorial.Subhead>
        <Editorial.P>
          Unerfüllter Kinderwunsch ist ein intimes Thema, über das Paare selten
          offen sprechen. Wenn sie es aber tun, machen viele von ihnen die
          Erfahrung, dass eine künstliche Befruchtung als Königsweg angesehen
          wird. So, als müsste man einmal kurz zur IVF und schwupps, sei der
          Nachwuchs unterwegs. Auch dann, wenn die Frau 42 oder 43 Jahre alt
          ist.
        </Editorial.P>

        <Editorial.P>
          Auf natürlichem Wege haben gesunde Paare in ihren Zwanzigern eine
          Chance von rund 25 Prozent pro Zyklus, schwanger zu werden. Das
          heisst, im Durchschnitt erwartet eine Frau nach vier Monaten
          ungeschütztem Verkehr ein Kind. Ende 30 dauert es bereits doppelt so
          lang – im Durchschnitt acht Monate. Ob eine Frau schwanger wird, hängt
          real von vielen Faktoren ab. .
        </Editorial.P>

        <Editorial.P>
          Mit Hilfe von IVF sieht es nach zwei Zyklen so aus:
        </Editorial.P>

        <Editorial.P>
          Frauen bis Mitte 30 sind in der Mehrheit schwanger (
          <Highlight colorKey={key} color='two'>
            gut 60 von 100
          </Highlight>
          ).
        </Editorial.P>
        <Editorial.P>
          Bei den Frauen bis Ende 30 wird jede Zweite schwanger (
          <Highlight colorKey={key} color='three'>
            50 von 100
          </Highlight>
          ).
        </Editorial.P>
        <Editorial.P>
          Jenseits der 40 ist es gut jede Vierte (
          <Highlight colorKey={key} color='four'>
            26 von 100
          </Highlight>
          ).
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 2}
        onChangeInView={handleInView(2)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 2}>3</ChapterIndicator>
          Der Weg zum Kind
        </Editorial.Subhead>
        <Editorial.P>
          Halten Eltern glücklich ihr Baby auf dem Arm, sieht man ihnen den Weg
          nicht an, den sie für dieses Kind gegangen sind.
        </Editorial.P>

        <Editorial.P>
          Als 1978 in Grossbritannien Louise Joy Brown geboren wurde, das erste
          In-Vitro-Baby, hatten ihre Eltern seit neun Jahren einen unerfüllten
          Kinderwunsch. Ihre Mutter konnte nicht auf natürlichem Weg schwanger
          werden. Hätten der Genetiker Robert Edwards und der Gynäkologe Patrick
          Steptoe nicht just die Befruchtung in der Petrischale zur Reife
          gebracht, die Browns wären kinderlos geblieben.
        </Editorial.P>

        <Editorial.P>
          IVF entstand, um Probleme mit der Zeugungsfähigkeit auszugleichen.
          Wenn zum Beispiel die Eileiter der Frau nicht durchlässig sind oder
          die Spermien des Mannes zu langsam. Ähnlich wie bei einer natürlichen
          Zeugung kumulieren sich die Chancen der Paare mit der Zeit, schwanger
          zu werden:
        </Editorial.P>

        <Editorial.P>
          Nach dem dritten IVF-Transfer sind fast drei Viertel aller Frauen bis
          Mitte 30 schwanger (
          <Highlight colorKey={key} color='two'>
            70-73 von 100
          </Highlight>
          ).
        </Editorial.P>
        <Editorial.P>
          Bis Ende 30 sind es weniger: knapp
          <Highlight colorKey={key} color='three'>
            60 von 100
          </Highlight>
          werden nach drei Transfers schwanger.
        </Editorial.P>
        <Editorial.P>
          Im Alter von mehr als 40 Jahren ist nach dem dritten Transfer knapp
          jede dritte Frau schwanger (
          <Highlight colorKey={key} color='four'>
            31 von 100
          </Highlight>
          ).
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 3}
        onChangeInView={handleInView(3)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 3}>4</ChapterIndicator>
          Schwanger, aber kein Kind
        </Editorial.Subhead>
        <Editorial.P>
          Bei Paaren mit Kinderwunsch wird der weibliche Zyklus schnell zum
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
          Wer Monat für Monat gezittert und gehadert hat, für den ist allein ein
          positiver Schwangerschaftstest ein Geschenk des Himmels. Ein konkretes
          Wesen, das entsteht, wo vorher immer nur nichts war. Hoffen dürfen.{' '}
        </Editorial.P>

        <Editorial.P>
          Und dann kann es sein, leider, dass das Kind in diesen ersten Wochen
          stirbt. Jede vierte Schwangerschaft, die per IVF entsteht, endet mit
          einer Fehlgeburt. Das erscheint mehr als bei natürlich entstandenen
          Schwangerschaften, allerdings gibt es hier nur Schätzwerte (10-20
          Prozent). Ein Vergleich lässt sich darum nicht gut ziehen.
        </Editorial.P>

        <Editorial.P>
          Bei Frauen ist der Vorrat an Eizellen seit der Geburt angelegt, darum
          nimmt die Qualität der Eizellen über die Jahrzehnte ab. In Folge
          steigt die Zahl der Fehlgeburten – der Körper verabschiedet sich so
          von Embryonen, deren chromosomale Entwicklung nicht so verläuft, dass
          das Kind lebensfähig wäre.
        </Editorial.P>

        <Editorial.P>Die Realität sieht so aus:</Editorial.P>
        <Editorial.P>
          Nach dem vierten Transfer sind fast vier von fünf Frauen bis Mitte 30
          schwanger (
          <Highlight colorKey={key} color='two'>
            78 von 100
          </Highlight>
          ). Die Fehlgeburtsrate liegt im Alter von 35 Jahren bei 20 Prozent.
        </Editorial.P>
        <Editorial.P>
          Bis Ende 30 werden bis nach dem vierten Transfer knapp zwei Drittel
          der Frauen schwanger (
          <Highlight colorKey={key} color='three'>
            63 von 100
          </Highlight>
          ). Die Fehlgeburtsrate liegt mit 39 Jahren bei 30 Prozent.
        </Editorial.P>
        <Editorial.P>
          Mit dem vierten Transfer steigt die Schwangerschaftsrate jenseits der
          40 noch einmal etwas (
          <Highlight colorKey={key} color='four'>
            33 von 100 Frauen
          </Highlight>
          ). Jede dritte Schwangere verliert das Kind dann wieder, im Alter von
          44 Jahren ist es bereits mehr als jede Zweite.
        </Editorial.P>
      </ScrollySlide>
      <ScrollySlide
        highlighted={lastInView === 4}
        onChangeInView={handleInView(4)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 4}>5</ChapterIndicator>
          Ein Kind muss man sich leisten können
        </Editorial.Subhead>
        <Editorial.P>
          In der Schweiz hängen die Chancen auf ein Kind nicht nur ab von der
          Medizin, sondern auch vom eigenen Geldbeutel. Denn anders als in
          vielen Ländern Europas werden die Kosten für eine IVF nicht von der
          Krankenkasse übernommen.
        </Editorial.P>

        <Editorial.P>
          Wer fünf IVF-Transfers braucht, hat an die 50’000 Franken ausgegeben,
          um schwanger zu werden.
        </Editorial.P>

        <Editorial.P>Die Chancen auf Erfolg:</Editorial.P>
        <Editorial.P>
          Bis Mitte 30 wird die grosse Mehrheit der Frauen schwanger nach fünf
          oder mehr Transfers (
          <Highlight colorKey={key} color='two'>
            82 von 100
          </Highlight>
          ).
        </Editorial.P>
        <Editorial.P>
          Mitte bis Ende 30 sind nach fünf Transfers oder mehr gut zwei Drittel
          der Frauen schwanger, die ein Kind möchten (
          <Highlight colorKey={key} color='three'>
            68 von 100
          </Highlight>
          ).
        </Editorial.P>
        <Editorial.P>
          Im Alter von 40 Jahren ist nach fünf oder mehr Transfers gut jede
          dritte Frau schwanger (
          <Highlight colorKey={key} color='four'>
            35 von 100
          </Highlight>
          ). Zwei von drei Frauen müssen also akzeptieren, dass der
          Schwangerschaftstest negativ bleibt.
        </Editorial.P>
        <Editorial.P>
          Aber die Hoffnung, die Ausnahme zu sein, bleibt berechtigt.
        </Editorial.P>
      </ScrollySlide>
    </div>
  )
}

const Highlight = ({ color, colorKey, children }) => {
  const bright = `${color}Bright`
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
          style={{ backgroundColor: COLORS[colorKey][bright] }}
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
  highlight: css({
    whiteSpace: 'nowrap',
    margin: '-1px 0 1px 0',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.8em 0.3em',
    padding: '0.1em 0.1em 0.1em 0.2em',
    lineHeight: '20px',
  }),
  circle: css({
    display: 'inline-block',
    borderRadius: '50%',
    width: '12px',
    height: '12px',
    marginRight: '5px',
    marginTop: '0.1em',
  }),
}
