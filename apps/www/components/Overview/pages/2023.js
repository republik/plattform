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
  Februar: (p) => (
    <>
      <Highlight {...p} ids={['IgFtBonck']}>
        Ja, Zukunftslust, verdammt
      </Highlight>
      ! Die{' '}
      <Highlight
        {...p}
        ids={['rxhAUQ8WU']}
        series='republik/article-serie-islamische-republik-versus-iran'
      >
        Revolution im Iran
      </Highlight>
      . Die{' '}
      <Highlight {...p} ids={['KzSZtqzQt']}>
        Türme in Basel
      </Highlight>
      . Und{' '}
      <Highlight {...p} ids={['uyW5-2Vvi']}>
        überall Sisi
      </Highlight>
      .{' '}
      <Highlight {...p} ids={['IXv0O_1Z0']}>
        MeToo bei Tamedia
      </Highlight>{' '}
      und{' '}
      <Highlight {...p} ids={['6mf-Hrkw5']}>
        warum sich Opfer erst spät wehren
      </Highlight>
      .{' '}
      <Highlight {...p} ids={['agfNZVm3y']}>
        Wie unser Immunsystem funktioniert
      </Highlight>{' '}
      und{' '}
      <Highlight {...p} ids={['2B6IXmT9V']}>
        wer von Ihrem Trinkgeld profitiert
      </Highlight>
      . Das{' '}
      <Highlight {...p} ids={['e6OilgIiW']}>
        etwas andere Interview
      </Highlight>
      . Zum Ende der{' '}
      <Highlight
        {...p}
        ids={['3q2REyYgj']}
        series='republik/article-do-not-feed-the-google'
      >
        Google-Serie
      </Highlight>
      :{' '}
      <Highlight {...p} ids={['58yLdtvY6L']}>
        Ein Hintergrundgespräch
      </Highlight>{' '}
      und{' '}
      <Highlight
        {...p}
        ids={['OHQo01tczO']}
        format='republik/format-republik-live'
      >
        eine Gala
      </Highlight>
      . Und ein Jahr nach Kriegsbeginn: die{' '}
      <Highlight {...p} ids={['tmUjk1wS2']}>
        Debatte über Kriegsmaterialexporte
      </Highlight>
      , die{' '}
      <Highlight {...p} ids={['C_y2ac2-d']}>
        Schweiz schaut weg beim Rohstoffhandel
      </Highlight>{' '}
      – und eine{' '}
      <Highlight {...p} ids={['7Cvb-eUh3']}>
        Würdigung der Getöteten in der Ukraine
      </Highlight>
      .
    </>
  ),
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
