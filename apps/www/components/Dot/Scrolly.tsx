import { useState } from 'react'

import { css } from 'glamor'

import { Editorial, useColorContext } from '@project-r/styleguide'

import { ScrollySlide } from './ScrollySlide'
import { ChapterIndicator } from './ChapterIndicator'
import { StoryGraphic } from './StoryGraphic'

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
          Der Anfang
        </Editorial.Subhead>
        <Editorial.P>
          Viele denken, dass In-Vitro-Fertilisation ein sicherer Weg ist, um
          auch mit über 40 noch schwanger zu werden. Das stimmt in begrenztem
          Masse. Tatsächlich zeigt die Statistik: Jenseits der 40 wird es auch
          mit IVF deutlich weniger wahrscheinlich, überhaupt schwanger zu
          werden.
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 1}
        onChangeInView={handleInView(1)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 1}>2</ChapterIndicator>
          Januar 2022
        </Editorial.Subhead>
        <Editorial.P>Gleicher Ort, gleiche Zeit. Ein Jahr vorher.</Editorial.P>

        <Editorial.P>Die 2000mm wirken ein bisschen dürftig.</Editorial.P>

        <Editorial.P>
          War nun der Januar 2023 aussergewöhnlich trocken oder der Januar 2022
          übermässig nass?
        </Editorial.P>

        <Editorial.P>
          Was wäre nun, wenn eine Meteorologin sagen würde: «Der Januar 2022 war
          ebenfalls ziemlich trocken.»
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 2}
        onChangeInView={handleInView(2)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 2}>3</ChapterIndicator>
          Referenzperiode
        </Editorial.Subhead>
        <Editorial.P>
          Die geringe Niederschlagsmenge im Januar 2023 ist nicht einfach eine
          statistische Anomalie, sondern Teil eines grösseren Trends.
        </Editorial.P>

        <Editorial.P>Die Schweizer Winter werden immer trockener.</Editorial.P>

        <Editorial.P>
          Vergleicht man die Referenzperiode von 1931 bis 1960 mit der aktuellen
          Referenzperiode, zeigt sich deutlich, dass unsere Eltern noch mehr
          Schnee gesehen haben als unsere Kinder heute.
        </Editorial.P>

        <Editorial.P>
          Und es geht um mehr als die Kindheits-erinnerungen an ein
          Winterwunderland.{' '}
        </Editorial.P>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 3}
        onChangeInView={handleInView(3)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 3}>4</ChapterIndicator>
          Gletscher
        </Editorial.Subhead>
        <Editorial.P>
          «Wir haben mehr als die Hälfte des Winters hinter uns, und die
          Schneedecke auf den Schweizer Gletschern ist immer noch stark
          unterdurchschnittlich», sagt der Glaziologe Matthias Huss.
        </Editorial.P>

        <Editorial.P>
          Eine Analyse der bisherigen Daten zur Schneedecke zeigt: Das Jahr 2023
          kommt dem Extrem vom letzten Jahr erschreckend nahe.
        </Editorial.P>

        <Editorial.P>
          Obwohl die Daten noch nicht vollständig vorhanden sind, ist für Huss
          klar: «Die extreme Winterdürre betrifft alle Regionen der Schweiz.»
        </Editorial.P>
      </ScrollySlide>
      <ScrollySlide
        highlighted={lastInView === 4}
        onChangeInView={handleInView(4)}
      >
        <Editorial.Subhead>
          <ChapterIndicator highlighted={lastInView === 4}>5</ChapterIndicator>
          Mehr als 4 Transfers
        </Editorial.Subhead>
        <Editorial.P>
          «Wir haben mehr als die Hälfte des Winters hinter uns, und die
          Schneedecke auf den Schweizer Gletschern ist immer noch stark
          unterdurchschnittlich», sagt der Glaziologe Matthias Huss.
        </Editorial.P>

        <Editorial.P>
          Eine Analyse der bisherigen Daten zur Schneedecke zeigt: Das Jahr 2023
          kommt dem Extrem vom letzten Jahr erschreckend nahe.
        </Editorial.P>

        <Editorial.P>
          Obwohl die Daten noch nicht vollständig vorhanden sind, ist für Huss
          klar: «Die extreme Winterdürre betrifft alle Regionen der Schweiz.»
        </Editorial.P>
      </ScrollySlide>
    </div>
  )
}

const styles = {
  scrolly: css({
    position: 'relative',
    scrollSnapType: 'y mandatory',
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
