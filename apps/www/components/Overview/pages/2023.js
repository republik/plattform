import { Highlight } from '../Elements'
import Page from '../Page'

const text = {
  Januar: (p) => (
    <>
      Das Klimalabor startet mit einer{' '}
      <Highlight {...p} ids={['rTrXpmE1r']}>
        Ansage zum Journalismus in der Krise
      </Highlight>
      . Dazu ein{' '}
      <Highlight {...p} ids={['rOH7y3Ky3']}>
        Plädoyer für die Hoffnung
      </Highlight>
      , ein{' '}
      <Highlight {...p} ids={['oBVAcw5V_']}>
        zuversichtliches Gespräch
      </Highlight>{' '}
      und{' '}
      <Highlight {...p} ids={['2CWOxXhSq']}>
        viele Postkarten aus dem Jahr 2083
      </Highlight>
      . Das Problem mit{' '}
      <Highlight {...p} ids={['C7HcqyY-X']}>
        toxischer Männlichkeit
      </Highlight>{' '}
      und{' '}
      <Highlight
        {...p}
        ids={['MGvN1Al7v']}
        format='republik/format-ich-hab-mich-getaeuscht'
      >
        warum feministischer Fortschritt nicht linear ist
      </Highlight>
      .{' '}
      <Highlight
        {...p}
        ids={['8J1kwC9uz', 'FTGz9bUhS', 'MvsKvLYyo', 'Jyi5ZKtte']}
        format='republik/format-panamericana'
      >
        Unterwegs auf der Panamericana
      </Highlight>
      , in der{' '}
      <Highlight {...p} ids={['4SqoNqOBP']}>
        Ukraine
      </Highlight>{' '}
      und in{' '}
      <Highlight {...p} ids={['N6_gOYb_Y']}>
        Liechtenstein
      </Highlight>
      . Was{' '}
      <Highlight {...p} ids={['IXNHPyVGH']}>
        beim «Fall Berset» übersehen
      </Highlight>{' '}
      wurde und wie die{' '}
      <Highlight {...p} ids={['uApM4fx2_']}>
        Cybersicherheit bei Bundesrätin Amherd
      </Highlight>{' '}
      landete. Darf ein{' '}
      <Highlight {...p} ids={['7OFkZKH1P']}>
        Gefangener selbstbestimmt sterben
      </Highlight>
      ? Die{' '}
      <Highlight {...p} ids={['04fQDFqeg']}>
        grosse Google-Recherche
      </Highlight>
      . Und endlich wieder{' '}
      <Highlight {...p} ids={['BWG2UHWjt']}>
        Geschmacksache
      </Highlight>
      .
    </>
  ),
  //Februar: (p) => <></>,
  //März: (p) => <></>,
  //April: (p) => <></>,
  //Mai: (p) => <></>,
  //Juni: (p) => <></>,
  //Juli: (p) => <></>,
  //August: (p) => <></>,
  //September: (p) => <></>,
  //Oktober: (p) => <></>,
  //November: (p) => <></>,
  //Dezember: (p) => <></>,
}

const Overview2023 = (props) => <Page {...props} year={2023} text={text} />

export default Overview2023
