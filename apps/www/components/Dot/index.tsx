import { scaleOrdinal, scalePoint } from 'd3'
import { motion, useScroll, Variant } from 'framer-motion'
import { ReactNode, useRef, useState, useEffect } from 'react'

import { css } from 'glamor'
import { fontStyles, Center } from '@project-r/styleguide'

// GENERIC-Y STUFF

const RADIUS = 8
const PADDING_TOP = 50
const CIRCLE_PADDING = 1
const COLUMNS = 10
const SIZE = 2 * RADIUS + CIRCLE_PADDING

const dataSet = [...Array(100)].map((d, i) => {
  const colIndex = i % COLUMNS
  const rowIndex = Math.floor(i / COLUMNS)
  return {
    cx: colIndex * SIZE + RADIUS,
    cy: rowIndex * SIZE,
    r: RADIUS,
    delay: i * 5,
    id: i,
  }
})

const ChapterIndicator = ({
  highlighted,
  mini,
  children,
}: {
  highlighted?: boolean
  mini?: boolean
  children: ReactNode
}) => {
  return (
    <span
      className={mini ? 'ChapterIndicator mini' : 'ChapterIndicator'}
      data-highlight={highlighted ? 'true' : undefined}
    >
      {children}
    </span>
  )
}

const ScrollySlide = ({
  children,
  highlighted,
  onChangeInView,
}: {
  children: ReactNode
  highlighted?: boolean
  onChangeInView: (inView: boolean) => void
}) => {
  const ref = useRef(null)
  // const isInView = useInView(ref, { amount: 0.5, margin: '-30% 0px 0px 0px' }) // FIXME margin top should be correct bottom of graphic
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 50vh'],
  })

  useEffect(() => {
    const doSomething = (value) => {
      if (value >= 1) {
        onChangeInView(true)
      } else {
        onChangeInView(false)
      }
    }

    const unsubY = scrollYProgress.onChange(doSomething)

    return () => {
      unsubY()
    }
  }, [scrollYProgress])

  return (
    <section
      ref={ref}
      className='ScrollySlide'
      style={{ opacity: highlighted ? 1 : 0.5 }}
    >
      {children}
    </section>
  )
}

// CONTENT-Y STUFF

type StoryVariant = 'step0' | 'step1' | 'step2' | 'step3' | 'step4'
const variantKeys: StoryVariant[] = [
  'step0',
  'step1',
  'step2',
  'step3',
  'step4',
]
const defineVariants = (
  defaultVariant: Variant,
  variants: Partial<Record<StoryVariant, Variant>>,
) => {
  const v: Partial<Record<StoryVariant, Variant>> = {}
  for (const k of variantKeys) {
    v[k] = variants[k] ?? defaultVariant
  }
  return v
}
const getVariant = (highlighted: number) => {
  switch (highlighted) {
    case 0:
      return 'step1'
    case 1:
      return 'step2'
    case 2:
      return 'step3'
    case 3:
      return 'step4'
  }
  return 'step0'
}

const StoryGraphic = ({ highlighted }: { highlighted: number }) => {
  return (
    <motion.svg
      viewBox='0 0 1000 750'
      preserveAspectRatio='xMidYMid meet'
      style={{ width: '100%', height: '100%' }}
      width='1000'
      height='750'
      initial='step0'
      animate={getVariant(highlighted)}
    >
      <defs>
        <marker
          id='arrowhead'
          viewBox='0 0 10 10'
          refX='3'
          refY='5'
          markerWidth='6'
          markerHeight='6'
          orient='auto'
        >
          <path d='M 0 0 L 10 5 L 0 10 z' style={{ fill: 'currentcolor' }} />
        </marker>
      </defs>

      <g transform={`translate(${RADIUS}, ${PADDING_TOP})`}>
        {dataSet.map((d, i) => {
          return (
            <motion.circle
              key={`ref-${d}`}
              transition={{ duration: 0.5 }}
              variants={defineVariants(
                {
                  y: d.cy,
                  x: d.cx,
                  r: 0,
                  opacity: 0,
                },
                {
                  step1: {
                    y: d.cy,
                    x: d.cx,
                    r: d.r,
                    opacity: 1,
                    fill: i < 40 ? 'red' : 'blue',
                  },
                  step2: {
                    y: d.cy,
                    x: d.cx,
                    r: d.r,
                    opacity: 1,
                    fill: i < 60 ? 'red' : 'blue',
                  },
                },
              )}
            ></motion.circle>
          )
        })}
      </g>
    </motion.svg>
  )
}

const Scrolly = () => {
  const [inViewList, setInViewList] = useState([false, false, false, false])

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
      <div className='ScrollyGraphics' {...styles.scrollyGraphicsContainer}>
        <div
          className='ScrollyGraphicsChapters'
          {...styles.scrollyGraphicsChapters}
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
        <h2>
          <ChapterIndicator highlighted={lastInView === 0}>1</ChapterIndicator>
          Januar 2023
        </h2>
        <p>Dieser Punkt entspricht 92’000’000’000 Kubikmeter Wasser.</p>
        <p>
          Das ist der gesammte Niederschlag, der im Januar 2023 auf die Schweiz
          gefallen ist.
        </p>
        <p>
          Sprechen Meteorologen über Niederschlag, stellen sie sich dabei eine
          Säule aus Wasser vor, die auf einem Sockel von 1 Quadratmeter steht
          und in die Höhe ragt. Die Wassermenge im Januar 2023 erstreckt sich
          über 2000mm in die Höhe.
        </p>

        <p>Sie fragen sich nun: Ist das viel?</p>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 1}
        onChangeInView={handleInView(1)}
      >
        <h2>
          <ChapterIndicator highlighted={lastInView === 1}>2</ChapterIndicator>
          Januar 2022
        </h2>
        <p>Gleicher Ort, gleiche Zeit. Ein Jahr vorher.</p>

        <p>Die 2000mm wirken ein bisschen dürftig.</p>

        <p>
          War nun der Januar 2023 aussergewöhnlich trocken oder der Januar 2022
          übermässig nass?
        </p>

        <p>
          Was wäre nun, wenn eine Meteorologin sagen würde: «Der Januar 2022 war
          ebenfalls ziemlich trocken.»
        </p>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 2}
        onChangeInView={handleInView(2)}
      >
        <h2>
          <ChapterIndicator highlighted={lastInView === 2}>3</ChapterIndicator>
          Referenzperiode
        </h2>
        <p>
          Die geringe Niederschlagsmenge im Januar 2023 ist nicht einfach eine
          statistische Anomalie, sondern Teil eines grösseren Trends.
        </p>

        <p>Die Schweizer Winter werden immer trockener.</p>

        <p>
          Vergleicht man die Referenzperiode von 1931 bis 1960 mit der aktuellen
          Referenzperiode, zeigt sich deutlich, dass unsere Eltern noch mehr
          Schnee gesehen haben als unsere Kinder heute.
        </p>

        <p>
          Und es geht um mehr als die Kindheits-erinnerungen an ein
          Winterwunderland.{' '}
        </p>
      </ScrollySlide>

      <ScrollySlide
        highlighted={lastInView === 3}
        onChangeInView={handleInView(3)}
      >
        <h2>
          <ChapterIndicator highlighted={lastInView === 3}>4</ChapterIndicator>
          Gletscher
        </h2>
        <p>
          «Wir haben mehr als die Hälfte des Winters hinter uns, und die
          Schneedecke auf den Schweizer Gletschern ist immer noch stark
          unterdurchschnittlich», sagt der Glaziologe Matthias Huss.
        </p>

        <p>
          Eine Analyse der bisherigen Daten zur Schneedecke zeigt: Das Jahr 2023
          kommt dem Extrem vom letzten Jahr erschreckend nahe.
        </p>

        <p>
          Obwohl die Daten noch nicht vollständig vorhanden sind, ist für Huss
          klar: «Die extreme Winterdürre betrifft alle Regionen der Schweiz.»
        </p>
      </ScrollySlide>
    </div>
  )
}

const DotApp = () => {
  return (
    <Center>
      <div className='content'>
        <h1>Dürrer Winter</h1>
        <p className='subtitle'>
          Die Schule ist aus, die Winterferien beginnen. Nur: Wo bleibt der
          Schnee. Eine Einordnung in vier Schritten.
        </p>
        <p className='byline'>
          Von Anna Traussnig und Felix Michel, 17.02.2023
        </p>
      </div>

      {/* <section className="content">
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quis ut,
            recusandae sit tenetur similique laboriosam delectus ea a, pariatur
            aliquam dignissimos, voluptas inventore! Fuga sapiente facere,
            provident vel deleniti rerum.
          </p>
        </section> */}
      <Scrolly />
      <section className='content' style={{ minHeight: '100vh' }}>
        <div className='About'>
          <h3>Zu den Daten</h3>

          <p>
            Die Daten zu den Niederschlägen stammen von Meteoschweiz. Für die
            Referenzperioden wurden die Durchschnittswerte berechnet. Die Daten
            zum Gletscher Plaine Morte wurden von Matthias Huss aufbereitet und
            der Republik zur Verfügung gestellt.
          </p>
        </div>
      </section>
    </Center>
  )
}

export default DotApp

const styles = {
  scrolly: css({
    position: 'relative',
  }),
  scrollySlide: css({
    transition: 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)',
    padding: '1rem',
    maxWidth: '43rem',
    margin: '0 auto',
  }),
  scrollyGraphicsContainer: css({
    position: 'sticky',
    top: 0,
    /* min-height: 50dvh; */
    background: '#fff',
    width: '100%',
    zIndex: 1,
    display: 'flex',
    height: '75vw',
    maxHeight:
      '40vh' /* don't use dvh here, otherwise the layout will jump when scrolling */,
  }),
  scrollyGraphicsChapters: css({
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
  }),
  chapterIndicator: css({}),
}
