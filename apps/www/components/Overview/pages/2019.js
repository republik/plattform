import React from 'react'
import { Highlight, A } from '../Elements'
import Page from '../Page'

const text = {
  Januar: (p) => (
    <>
      Die Republik startet mit einer grossen{' '}
      <Highlight
        {...p}
        series='republik/article-die-gefraessige-genossenschaft'
      >
        Serie über die Migros
      </Highlight>{' '}
      ins zweite Jahr. «
      <Highlight {...p} series='republik/article-intro'>
        An der Bar
      </Highlight>
      » nimmt GLP-Fraktionschefin Tiana Angelina Moser Platz. Lukas Bärfuss
      schreibt einen{' '}
      <Highlight {...p} ids={['SwgdwGJEW']}>
        Essay gegen das Storytelling
      </Highlight>{' '}
      im Journalismus. Und eine Recherche über das{' '}
      <Highlight {...p} ids={['8bAZr6V2o']}>
        E-Voting-Projekt der Post
      </Highlight>{' '}
      sorgt für Wirbel.
    </>
  ),
  Februar: (p) => (
    <>
      Das Thema Zersiedelung beschäftigt die Redaktion. In einem{' '}
      <Highlight {...p} ids={['8_3Zpsz5U']}>
        interaktiven Beitrag
      </Highlight>{' '}
      zeigen wir auf, wo in Zukunft noch Schnee liegt. Das Thema Gentechnik gibt
      zu reden. Ausserdem eine Recherche zu den{' '}
      <Highlight {...p} ids={['bPvA8knZW']}>
        Kriegsgewinnlern in Syrien
      </Highlight>
      , ein{' '}
      <Highlight {...p} ids={['48_vcBLSs']}>
        Essay zu Identitätspolitik
      </Highlight>{' '}
      und die Frage: Brauchen wir wirklich noch mehr Autobahnen?
    </>
  ),
  März: (p) => (
    <>
      Auf{' '}
      <Highlight {...p} ids={['ohlgcekzS']}>
        Beizentour mit SVP-Nationalrat Fredi Heer
      </Highlight>
      . Warum Frauen die Schweiz voranbringen. Eine Reportage aus dem
      Flüchtlingslager in Lesbos. Die Analyse zum Erfolg der Klimaproteste – und
      wie sie überleben können.{' '}
      <Highlight {...p} ids={['C8iXl8wpU', '8Va6rD417']}>
        Die CVP im Wahljahr
      </Highlight>
      . Und die grosse Recherche zu den{' '}
      <Highlight
        {...p}
        series='republik/article-eth-auftakt'
        ids={['WTbOUrJ9p']}
      >
        Missständen bei der ETH
      </Highlight>
      .
    </>
  ),
  April: (p) => (
    <>
      Sie fragen ja nur – unser Schwerpunkt zu Verschwörungstheorien. Eine{' '}
      <Highlight {...p} series='republik/article-auftakt-brexit-serie'>
        Tour durch Brexit-Britannien
      </Highlight>
      . Wie (Klima-)Grafiken täuschen können. Und warum Wetterextreme das neue
      Normal sind. Eine{' '}
      <Highlight {...p} series='republik/article-knonau-master'>
        Podcast-Serie zum Brand von Knonau
      </Highlight>
      . Und{' '}
      <Highlight
        {...p}
        series='republik/article-eth-auftakt'
        ids={['8_xfgyamGq', 'IeTMTN2sP', 'ablDhocUlB']}
      >
        Neues von der ETH
      </Highlight>
      .
    </>
  ),
  Mai: (p) => (
    <>
      Neue Erzählformen bei der Republik!{' '}
      <Highlight {...p} ids={['Qh8NGgtsL']}>
        Leben von der Sozialhilfe – das interaktive Spiel
      </Highlight>
      . Neue Folgen der Podcast-Serie «
      <Highlight {...p} series='republik/article-knonau-master'>
        Zündstoff
      </Highlight>
      ». Und die Europawahl-Tour «
      <Highlight {...p} series='republik/article-auftakt-cafe-europa'>
        Café Europa
      </Highlight>
      ». Dazu Hintergründiges zu{' '}
      <Highlight {...p} ids={['cEhaVQGe4']}>
        Big Tech
      </Highlight>
      ,{' '}
      <Highlight {...p} ids={['Ja36o8ATl']}>
        Emotionen
      </Highlight>{' '}
      und Emmanuel Macron, Interviews mit{' '}
      <Highlight {...p} ids={['JW0LfnoEf']}>
        Flavia Kleiner
      </Highlight>
      ,{' '}
      <Highlight {...p} ids={['F6jCCSISw']}>
        Carolin Emcke
      </Highlight>{' '}
      und{' '}
      <Highlight {...p} ids={['zF-0AgP-Z']}>
        Christoph Eymann
      </Highlight>{' '}
      – und eine internationale Recherche zur{' '}
      <Highlight {...p} ids={['4KghliqyY', 'XyPBPe3iai']}>
        organisierten Kriminalität
      </Highlight>
      .
    </>
  ),
  Juni: (p) => (
    <>
      Wir starten unsere{' '}
      <Highlight {...p} series='republik/article-wahnsinn-wahlkampf'>
        Wahlkampf-Serie
      </Highlight>
      , wir porträtieren{' '}
      <Highlight {...p} ids={['4C69J-4mS']}>
        Margrethe Vestager
      </Highlight>{' '}
      und machen uns mit den Recherchen zum{' '}
      <Highlight {...p} ids={['Dyn8P8dr0']}>
        Fall Spiess-Hegglin
      </Highlight>{' '}
      und{' '}
      <A href='https://www.republik.ch/2019/06/29/der-putsch'>Zürcher Kosmos</A>{' '}
      nicht nur Freunde. Ausserdem zeigen wir auf, wie der Staat die{' '}
      <Highlight {...p} series='republik/article-teil-1-mike'>
        Grundrechte eines Intensivtäters verletzt
      </Highlight>
      , warum Depression eine Volkskrankheit ist – und wie es um die{' '}
      <Highlight {...p} ids={['T6JZ9No_o']}>
        Geschlechterbalance in der Republik
      </Highlight>{' '}
      steht.
    </>
  ),
  Juli: (p) => (
    <>
      Recherchen zur{' '}
      <Highlight {...p} ids={['v5m1zIJ1a']}>
        Wahlkampffinanzierung der SVP
      </Highlight>{' '}
      und zu{' '}
      <Highlight {...p} ids={['XMPAu_lKG']}>
        Google in den Schulzimmern
      </Highlight>
      . Wie sich das{' '}
      <Highlight {...p} ids={['xKKd-W7p8']}>
        EDA von Philip Morris
      </Highlight>{' '}
      nicht nur sponsern, sondern auch einspannen lässt. Klimaerwärmung in den
      Städten – der{' '}
      <Highlight {...p} ids={['q-iptHtTc', 'OitZtrctGl']}>
        interaktive Städtetrip
      </Highlight>
      . Soll das{' '}
      <Highlight {...p} ids={['Y1QZ-hmw9']}>
        Sexualstrafrecht verschärft werden
      </Highlight>
      ? Die Serie «
      <Highlight {...p} series='republik/article-auftakt-strandgeschichten'>
        Am Strand
      </Highlight>
      » startet – jede Folge inklusive Spotify-Playlist. Ausserdem: Porträt von{' '}
      <Highlight {...p} ids={['FK8d4xV9P']}>
        FDP-Ständeratskandidat Thierry Burkart
      </Highlight>{' '}
      und Interview mit{' '}
      <Highlight {...p} ids={['harv8WmC2']}>
        Medienforscher Jay Rosen
      </Highlight>
      .
    </>
  ),
  August: (p) => (
    <>
      Schwerpunkt Klimawandel. Wie könnte die{' '}
      <Highlight {...p} ids={['5TNAznvgI']}>
        UBS klimaneutral
      </Highlight>{' '}
      werden? Wie konnte es zu den verheerenden{' '}
      <Highlight {...p} ids={['aXC9GmY7B']}>
        Waldbränden in Brasilien
      </Highlight>{' '}
      kommen? Und warum wurde die{' '}
      <Highlight {...p} ids={['MsaAiUjQZ']}>
        Klimakatastrophe so lange ignoriert
      </Highlight>
      ? Recherchen zur{' '}
      <Highlight {...p} ids={['yVpa7ceaJ']}>
        Credit Suisse in Moçambique
      </Highlight>
      , zur{' '}
      <Highlight {...p} ids={['ja_9jrjj5k']}>
        Facebook-Regulierung
      </Highlight>{' '}
      – und vertiefte Hintergründe zur{' '}
      <Highlight {...p} ids={['UnmW5bxMHk']}>
        Mietproblematik in Basel
      </Highlight>
      , zu{' '}
      <A href='https://www.republik.ch/2019/08/21/warum-feministische-comics-einen-nerv-treffen'>
        feministischen Comics
      </A>{' '}
      und zur{' '}
      <Highlight {...p} ids={['nHc2F70AC']}>
        Justizinitiative
      </Highlight>
      .
    </>
  ),
  September: (p) => (
    <>
      Wie ein{' '}
      <Highlight {...p} ids={['uU2bQvKK5']}>
        exotisches Feld der Physik
      </Highlight>{' '}
      die Welt verändern könnte. Wie sich{' '}
      <Highlight {...p} ids={['RCR793D0d']}>
        China in Europas Infrastruktur
      </Highlight>{' '}
      einnistet. Und warum die{' '}
      <Highlight {...p} ids={['g14gO0bSs', 'YdXdgv3cu']}>
        deutsche Autoindustrie ums nackte Überleben
      </Highlight>{' '}
      kämpft. Zu den Wahlen bieten wir einen{' '}
      <Highlight {...p} ids={['JTpoDVHSL']}>
        Selbsttest
      </Highlight>
      , ein{' '}
      <Highlight {...p} ids={['HiFVVIX5z']}>
        Deep-Dive zur reichsten Politikerin der Schweiz
      </Highlight>{' '}
      – und unser «
      <Highlight {...p} ids={['6B87ikAR9', '1doQRXY-T6']}>
        Republik Wahltindär
      </Highlight>
      ». Ausserdem: Wir nehmen Sie mit nach{' '}
      <Highlight {...p} ids={['X2fkUeBuK']}>
        Brexit-Britannien
      </Highlight>
      , nach{' '}
      <Highlight {...p} ids={['hqiPjpttM']}>
        Thailand
      </Highlight>{' '}
      und ins{' '}
      <Highlight {...p} ids={['xW08LDhkx']}>
        künstlerische Athen
      </Highlight>
      .
    </>
  ),
  Oktober: (p) => (
    <>
      Die Schweiz hat ein neues Parlament gewählt: die{' '}
      <Highlight {...p} ids={['8et6Ay9-G']}>
        Wahltagsreportage «Grünsonntag»
      </Highlight>
      .{' '}
      <Highlight {...p} ids={['RzILkcOeo']}>
        Was die Neuen in Bern erwartet,
      </Highlight>{' '}
      <Highlight {...p} ids={['MLyPnMi0t']}>
        warum Influencer in der Schweiz so apolitisch sind
      </Highlight>
      {'. '}
      Ausserdem: Warum die{' '}
      <Highlight {...p} ids={['1j-sxpDsD']}>
        Sehnsucht nach dem Weltkrieg den Brexit erklärt,
      </Highlight>{' '}
      wie der{' '}
      <Highlight {...p} series='republik/article-edz-intro-global'>
        Energiemix der Zukunft
      </Highlight>{' '}
      aussehen muss und wie ein schnell süchtig machendes{' '}
      <Highlight {...p} ids={['uswelgYCy']}>
        Schmerzmittel in der Schweiz auf dem Vormarsch
      </Highlight>{' '}
      ist. Sowie Hintergründiges zu arabischer Küche, Überwachung und Freerun.
    </>
  ),
  November: (p) => (
    <>
      Hat die Atomenergie einen Platz im{' '}
      <Highlight {...p} series='republik/article-edz-intro-global'>
        Kampf gegen den Klimawandel?
      </Highlight>{' '}
      Hat die «
      <Highlight {...p} series='republik/article-auftakt-p-r'>
        gefährlichste Frau der Schweiz
      </Highlight>
      » vielleicht gar nicht begangen, was ihr vorgeworfen wird? Und was hat der{' '}
      <Highlight {...p} ids={['bwyUGHYEm']}>
        Joker mit den Massenprotesten in Chile zu tun?
      </Highlight>{' '}
      Ausserdem: Interviews mit{' '}
      <Highlight {...p} ids={['dc8-HH-Tr']}>
        ETH-Klimaforscher Reto Knutti
      </Highlight>
      , Bestsellerautor Salman Rushdie und Journalist Deniz Yücel. Und wie der{' '}
      <Highlight {...p} ids={['18ngwhDpY']}>
        Fichenskandal die Schweizer Kunstszene
      </Highlight>{' '}
      getroffen hat.
    </>
  ),
  Dezember: (p) => (
    <>
      Die{' '}
      <Highlight {...p} ids={['v0AUVa73z']}>
        Schadensbilanz von Aussenminister Ignazio Cassis
      </Highlight>
      . Der{' '}
      <Highlight {...p} ids={['IbpSp_01-']}>
        Notstand in der Pflege
      </Highlight>
      . Reise in die arabische Welt – die grosse{' '}
      <Highlight {...p} series='republik/article-auftaktnahost'>
        Reportageserie aus dem Libanon, dem Irak, dem Sudan und aus Ägypten
      </Highlight>
      . Recherche zu den{' '}
      <Highlight {...p} ids={['PcxVOMXKn', 'Ueh1J2JTtl', '-UP8xCBL_']}>
        Missständen bei der grössten Kita-Kette
      </Highlight>{' '}
      der Schweiz. Die letzten Festtage der Menschheit – Rezept für ein{' '}
      <Highlight {...p} ids={['dvrE8QRHz']}>
        veganes Festmenü
      </Highlight>
      . Die Serie «
      <Highlight {...p} series='republik/article-mein-vater-der-gangster-1'>
        Mein Vater, der Gangster
      </Highlight>
      ». Vom{' '}
      <Highlight {...p} ids={['G1riy9_0D']}>
        Aufstieg des politischen Trolls
      </Highlight>
      . Und: «Wo ist die gute linke Politik?» – das grosse{' '}
      <Highlight {...p} ids={['-QzfE_C1b']}>
        Gespräch mit Schriftsteller Lukas Bärfuss
      </Highlight>
      .
    </>
  ),
}

const Overview2019 = (props) => <Page {...props} year={2019} text={text} />

export default Overview2019
