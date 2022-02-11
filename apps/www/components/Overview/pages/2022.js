import React from 'react'
import { Highlight } from '../Elements'
import Page from '../Page'

const text = {
  Januar: (p) => (
    <>
      Die Recherche über den{' '}
      <Highlight {...p} series='republik/article-serienuebersicht-kampfjets'>
        teuersten Rüstungskauf der Schweizer Geschichte
      </Highlight>
      .{' '}
      <Highlight {...p} ids={['vKxEpSFkk']}>
        Wie wegen einer Wolke alle in die Luft gehen
      </Highlight>{' '}
      und{' '}
      <Highlight {...p} ids={['XXv7us99s']}>
        wie Pfizer zum einflussreichsten Konzern der Pandemie wurde
      </Highlight>
      .{' '}
      <Highlight {...p} ids={['JYCGSL_SL']}>
        Faszination und Schrecken von dicken Büchern
      </Highlight>{' '}
      (
      <Highlight {...p} ids={['g_Hq6fOsv']}>
        zum Beispiel dieses
      </Highlight>
      ) – und die{' '}
      <Highlight {...p} ids={['oCvIDGHS2']}>
        Klimakrise in der Literatur
      </Highlight>
      .{' '}
      <Highlight {...p} ids={['CE1KVAwhzH']}>
        Wie junge Onlinemedien gegen den Einheitsbrei im Lokaljournalismus
        antreten
      </Highlight>{' '}
      und{' '}
      <Highlight {...p} ids={['E90ZSBlGif']}>
        wieso diese drei Männer das Mediengesetz bekämpfen
      </Highlight>
      . Die{' '}
      <Highlight {...p} ids={['f2JcMmGcC']}>
        Position von Project R zur Medienförderung
      </Highlight>
      ?{' '}
      <Highlight {...p} ids={['6YDhI5ZsP']}>
        Sie haben entschieden
      </Highlight>
      . Die{' '}
      <Highlight {...p} series='republik/article-serienuebersicht-zucker'>
        Macht des Zuckers
      </Highlight>{' '}
      (früher und heute) und der{' '}
      <Highlight {...p} ids={['NxST4T_Yw']}>
        Zigaretten
      </Highlight>{' '}
      (ebenso).{' '}
      <Highlight {...p} ids={['snxxyxJ9i']}>
        Diese Frauen mischen die Tech-Branche auf
      </Highlight>
      . Und:{' '}
      <Highlight {...p} ids={['DsJD8VZuv']}>
        Was haben Sie von Angela Merkel gelernt, Kevin Kühnert
      </Highlight>
      ?
    </>
  ),
}

const Overview2022 = (props) => <Page {...props} year={2022} text={text} />

export default Overview2022
