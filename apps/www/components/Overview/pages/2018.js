import { Highlight, A } from '../Elements'
import Page from '../Page'

const text = {
  Januar: (p) => (
    <>
      Die Republik geht mit{' '}
      <Highlight {...p} ids={['ByKAxDA8c0Zm', 'Bkm0xwA89AbX']}>
        irrational langen Beiträgen
      </Highlight>{' '}
      an den Start. Auftakt für den{' '}
      <Highlight
        {...p}
        ids={['BJn6eD0U90-m']}
        format='republik/format-am-gericht'
      >
        Schwerpunkt Justiz
      </Highlight>
      . Premiere der ersten Reportagen-Serie «
      <Highlight {...p} series='republik/article-usa-auftakt'>
        Race, Class, Guns and God
      </Highlight>
      ».{' '}
      <Highlight {...p} format='republik/format-bergs-nerds'>
        Sibylle Berg
      </Highlight>{' '}
      und{' '}
      <Highlight {...p} format='republik/format-binswanger'>
        Daniel Binswanger
      </Highlight>{' '}
      starten ihre Kolumnen.{' '}
      <Highlight {...p} ids={['BJ93gvRI5AWm', 'BkPogDAUcC-7']}>
        Globi besucht das WEF
      </Highlight>
      , wir analysieren Fox News und verteidigen den Service public.{' '}
      <Highlight {...p} ids={['HkNixPCLqCWQ', 'BkzjxvAIq0WQ', 'ByE9evAIqA-m']}>
        Doping-Recherchen
      </Highlight>{' '}
      sorgen international für Aufsehen.
    </>
  ),
  Februar: () => (
    <>
      Beppe Grillos Fünf-Sterne-Bewegung in Italien, Politwerbung auf Facebook:
      Digitale Themen werden zu einem Markenzeichen der Republik. Das Elend der
      SDA und die Zukunft der AHV beschäftigen Debatten wie Autorinnen. Die
      Audio-Podcasts gehen in Serie. Und{' '}
      <A href='https://www.republik.ch/2018/02/12/sie-wir-und-unser-gemeinsames-unternehmen'>
        wir haben Ihnen zugehört
      </A>
      .
    </>
  ),
  März: () => (
    <>
      Raiffeisen im Elend, «UBS im Dschungel» – und die Frage: Sind deutsche
      Whistleblower in der Schweiz tatsächlich Spione? Gespräche mit Politologin
      Silja Häusermann und Feministin Mona Eltahawy. Auftakt zur
      Sozialdetektiv-Debatte. Erstmals{' '}
      <A href='https://www.republik.ch/2018/03/01/die-republik-zum-hoeren'>
        lesen Autoren ihre Beiträge auch vor
      </A>{' '}
      – zum Anhören als Podcast.
    </>
  ),
  April: () => (
    <>
      Der «Mord auf Malta» und das Baukartell in Graubünden. Porträt über die
      Schweizer Chefdiplomatin Pascale Baeriswyl. Vorwürfe gegen den Zürcher
      Regierungsrat Mario Fehr. Gespräche mit Top-Ökonomen über die Zukunft
      Europas. Und: «Die zehn Gebote der Medienförderung».
    </>
  ),
  Mai: () => (
    <>
      Vollgeld für Dummies, Vollgeld für Nerds und der Libanon in der
      Panorama-Ansicht. Premiere des Videoformats «An der Bar» mit Carla Del
      Ponte. Debatte zum neuen EU-Datenschutzgesetz. Wir erklären, wie die
      Republik die{' '}
      <A href='https://www.republik.ch/2018/05/19/der-neue-datenschutz-der-republik'>
        Daten ihrer Nutzerinnen schützt
      </A>
      . Die PDF-Funktion startet: Ab sofort gibts die Republik auch auf Papier.
    </>
  ),
  Juni: () => (
    <>
      Die Türkei vor den Wahlen als Mini-Soap, Mexiko vor den Wahlen als
      Zweiteiler. Erste interaktive Serie zum Siegeszug des Computers. Die
      illustrierte Recherche zum «FC Kreml»: Wer profitiert von der Fussball-WM
      in Russland?{' '}
      <A href='https://www.republik.ch/2018/06/09/in-eigener-sache-zum-baukartell'>
        Klarstellung zu den Baukartell-Recherchen
      </A>
      . Und: Die Republik hat jetzt eine Suchfunktion.
    </>
  ),
  Juli: () => (
    <>
      Das Leben der Eritreer in der Schweiz, das Gesicht als Passwort und das
      Milliardengeschäft mit Baby-Aalen. Das Plädoyer für ein souveränes Europa
      und das Migrantinnen-Manifest. Wir fragen: Soll man Sex kaufen dürfen? Und
      auch in Deutschland wird «Merkel. Machos. Und die Macht» ein Hit.
    </>
  ),
  August: () => (
    <>
      Liebe, Sex und LSD, dazu – endlich! – der Start der «
      <A href='https://www.republik.ch/2018/08/21/ameisen-bevoelkern-die-republik'>
        Ameisen
      </A>
      ». Die Österreicherin der Republik, Solmaz Khorsand, hält die Rede zur
      Nation. Wir erklären alles Wichtige zu den flankierenden Massnahmen. Die
      Wortkünstlerin Fatima Moumouni im Porträt. Das Community-Projekt «
      <A href='https://www.republik.ch/2018/08/15/ihre-nachbarin-denkt-anders-als-sie-treffen-sie-sich-zum-gespraech'>
        Die Schweiz spricht
      </A>
      » wird lanciert. Und: Bildergalerien werden eingeführt.
    </>
  ),
  September: () => (
    <>
      Brasilien vor dem Faschismus, die «vorletzten Tage der Menschheit»,
      Chemnitz und Start der Drogen-Serie. Feministin Rebecca Solnit über die
      Unterdrückung der Frauen und Politologin Chantal Mouffe über
      Linkspopulismus. Die Abschaffung der Freiheit und die Lehren aus der
      Finanzkrise.{' '}
      <A href='https://www.republik.ch/2018/09/03/7-uhr-newsletter'>
        Feuilleton
      </A>{' '}
      und <A href='https://www.republik.ch/2018/09/01/app/diskussion'>App</A> –
      beides ist da!
    </>
  ),
  Oktober: () => (
    <>
      Unser Recherche-Netzwerk deckt die Dimension des Cum-Ex-Skandals auf. Der
      Zuger CVP-Justizdirektor Beat Villiger sorgt für den ersten Rechtsstreit,
      «Die Macht der Lüge in der Politik» für Reflexion. Google als Medienmäzen.
      Wir fragen: Wie recht hat das Volk? Podium zu #MeToo. Und die{' '}
      <A href='https://www.republik.ch/2018/10/31/wie-sie-waehlten-stimmten-und-was-sie-wollen'>
        Republik wird demokratisch
      </A>
      .
    </>
  ),
  November: () => (
    <>
      «Verrat in der Moschee». Das Ende der Sozialdemokratie. Zwei ehemalige
      Kindersoldaten, die das Schicksal an den Internationalen Strafgerichtshof
      spült. Wie die Politik beim Klimawandel versagt. Soros in der Schweiz. Der
      Schweizer Aussenminister Ignazio Cassis sitzt «An der Bar». Und die{' '}
      <A href='https://www.republik.ch/umfrage/2018'>
        erste Leserinnen-Umfrage
      </A>
      .
    </>
  ),
  Dezember: () => (
    <>
      Nicht der erste, sondern der definitive Artikel: «Aufstand der Peripherie»
      – die Analyse zu den Gelbwesten in Frankreich. Die Serie zum Klimawandel.
      Vom Leben mit non-binärer Geschlechtsidentität. Betablocker. Die
      Eine-Million-Dollar-Frage: Wer erfindet den Bullshit-Detektor? Und wir
      lancieren die{' '}
      <A href='https://www.republik.ch/2018/12/17/willkommen-im-neuen-republik-dialog'>
        Dialog-Plattform neu
      </A>
      .
    </>
  ),
}

const Overview2018 = (props) => <Page {...props} year={2018} text={text} />

export default Overview2018
