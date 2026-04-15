import { csvParse } from 'd3-dsv'
import { descending } from 'd3-array'

/* eslint-disable no-irregular-whitespace */
const data = csvParse(`description,category,origin,originLong,weight,mandatory
Unabhängig – kein Grosskonzern ist involviert.,D,BS,Basel,26,1
Ohne Werbung.,J,BS,Basel,23,1
Sie ist ein Funke Hoffnung im kaputten Mediensystem. ,D,BS,Basel,22,0
Die Republik ist für mich vertrauenswürdig.,J,SG,St. Gallen,21,0
Weil sie ganz anders und offener mit uns Verlegerinnen kommuniziert als andere Medien.,C,AG,Baden,14,1
"Kontroverse Debatten, anständig und hart geführt. ",C,SG,St. Gallen,13,0
"Weil sie den Mut hat, auch ganz nüchterne, längere Erklärartikel zu bringen.",J,AG,Baden,12,0
Die Journalistinnen diskutieren im Dialog mit. ,C,BS,Basel,12,1
Informieren statt konsumieren.,J,SG,St. Gallen,10,0
"Nicht «vollständig», dafür punktuell mit Tiefgang.",J,SG,St. Gallen,9,0
Die Republik gehört vielen statt wenigen.,C,BS,Basel,8,0
Weil sie auch zum Hören ist.,J,SG,St. Gallen,8,0
Sie hat ein gutes Korrektorat. ,J,BS,Basel,8,0
No News – dafür Inhalt.,J,SG,St. Gallen,7,0
"Es ist das Erste, was ich am Morgen mache.",J,AG,Baden,7,0
Wird ständig weiterentwickelt.,J,BS,Basel,7,0
Die Republik ist einfach teilbar. ,C,BS,Basel,7,0
"Offen, im Sinn von parteipolitisch unabhängig. ",D,SG,St. Gallen,7,0
Die Republik ist transparent: das Produkt und die Organisation.,C,ZH,Zürich,6,0
Grosse Vielfalt an Themen.,J,BS,Basel,6,0
Weil sie anregt und aufregt.,J,SG,St. Gallen,6,0
Weil Engagement und Mut belohnt gehören.,D,ZH,Zürich,6,0
"State-of-the-Art-Dossiers (zum Beispiel Klima, Energie, Digital).",J,ZH,Zürich,5,0
"Die R gibt das Gefühl, Teil eines Ganzen zu sein (= Gesellschaft von Bürgerinnen).",,SG,St. Gallen,5,0
Die Ästhetik!,,AG,Baden,5,0
Schöne Sprache.,,SG,St. Gallen,5,0
"Wegen ihres Muts, nicht auf jedes gehypte Thema aufzuspringen. ",,AG,Baden,5,0
"Die Journalistinnen haben viel Zeit, um an einem Thema zu recherchieren.",,BS,Basel,5,0
Es wird ein 50/50-Geschlechterverhältnis angestrebt (Schreibende/Crew).,,BS,Basel,5,0
Bei der Republik werden auch freie Autoren anständig bezahlt.,,BS,Basel,5,0
Ohne Journalismus keine Demokratie und ohne Demokratie keinen Journalismus.,,BS,Basel,5,0
"Keine Geschichten aus der täglichen Hektik, sondern darüber hinaus. ",,ZH,Zürich,4,0
Auch immer mal humorvolle Texte.,,SG,St. Gallen,4,0
Weil die Republik so gut übers Klima berichtete und dabei noch viel Potenzial hat.,,ZH,Zürich,4,0
Sie regt zum Denken an.,,BS,Basel,4,0
"Innovative Formate, R ist mehr als eine Zeitung: Buchclub, Interviews, Podcasts, Dossiers, viele Links zu anderen Zeitungen/Medien.",,ZH,Zürich,3,0
Tolle Bilder.,,BS,Basel,3,0
Lektüre beim Pendeln.,,BS,Basel,3,0
"Ich lese und lerne, ohne es zu merken.",,BS,Basel,3,0
Die Republik befreit die Menschen in ihrem Denken.,,ZH,Zürich,3,0
Weil ich gerne mit meinen Kolleginnen über Republik-Artikel rede. ,,ZH,Zürich,3,0
Leser und Journalist auf Augenhöhe.,,BS,Basel,3,0
Die Republik bildet junge Talente aus. ,,BS,Basel,3,0
Einzigartige Kombination von Qualitätsjournalismus und Unabhängigkeit.,,ZH,Zürich,2,0
Es kommen andere Menschen zu Wort.,,BS,Basel,2,0
"Tolle Unterhaltung, Spass.",,ZH,Zürich,2,0
Relevante Themen für alle Generationen.,,SG,St. Gallen,2,0
"Ferne Reisen, ohne aus dem Bett zu müssen.",,ZH,Zürich,2,0
Weil ich da die besten Geschichten lese.,,BS,Basel,2,0
Für die Republik finde ich Zeit zum Lesen.,,SG,St. Gallen,2,0
Sie ist unaufgeregt.,,AG,Baden,2,0
Keine Ablenkung beim Lesen.,,SG,St. Gallen,2,0
Weil die Republik auf Neid verzichtet.,,ZH,Zürich,2,0
"Sie trägt eine klar fortschrittliche Tendenz weiter, ohne aufdringlich zu werden. ",,ZH,Zürich,2,0
Weil ich lesend die Welt verstehen will. ,,AG,Baden,2,0
Neuer Journalismus für eine neue Welt. ,,ZH,Zürich,2,0
Weil die 2020er nicht wie die 1920er werden dürfen.,,ZH,Zürich,2,0
"In zwei Jahren haben wir vieles erreicht, stell dir vor, was wir in fünf oder zehn Jahren erreichen.",,ZH,Zürich,2,0
"Ich brauche sie, und sie braucht mich.",,LU,Luzern,2,0
"Weil sie jetzt schon mehr leistet, als sie kostet.",,BE,Bern,2,0
Es gibt einen Genossenschaftsrat als Sounding Board und Ideengeber.,,BS,Basel,1,0
"Die Schweiz braucht ein leserfinanziertes Medium, und sei es nur als «role model».",,ZH,Zürich,1,0
Hintergründe und Analysen zu internationalen Themen und Bewegungen.,,BE,Bern,1,0
Nirgends sonst diese Tiefe von Informationen.,,AG,Baden,1,0
Sie hat Stil.,,SG,St. Gallen,1,0
Überall und immer verfügbar (weil online).,,SG,St. Gallen,1,0
"IT ist einwandfrei: Links, Podcasts, Navigation usw. funktionieren blitzschnell und sauber.",,ZH,Zürich,1,0
Reagiert schnell und kompetent auf Twitter.,,BS,Basel,1,0
Weil die Republik nicht zynisch ist.,,ZH,Zürich,1,0
Die Debatten sind (noch) nicht mit Lobbyisten verseucht.,,ZH,Zürich,1,0
"Mehrere tolle, gescheite, humorvolle Autoren.",,AG,Baden,1,0
Weil es keine Alternative gibt.,,AG,Baden,1,0
Die Republik baut ein zukunftsträchtiges Business-Modell für Qualitätsjournalismus auf. ,,BE,Bern,1,0
"Infos aus der nationalen Politik – kurz, knackig und gehaltvoll (Briefing aus Bern).",,LU,Luzern,0,0
"Wirft neue Themen und Fragen auf, anstatt populäre Themen/Meinungen aufzunehmen. ",,BE,Bern,0,0
Interviews mit relevanten Akteuren des sozialen Geschehens.,,BE,Bern,0,0
"Lange und tiefgründige Serien, packend wie ein Krimi.",,BE,Bern,0,0
Eine der besten Ratgeberinnen bei Wahlen.,,ZH,Zürich,0,0
«Meta-Journalismus» – Hintergrundinfos über eigene Prozesse und Gedanken.,,BE,Bern,0,0
Hochinformative Justizkolumne!,,BE,Bern,0,0
Partizipativ – ich fühle mich gehört und involviert und verbunden. ,,BE,Bern,0,0
Gibt mir Argumente bei komplexen Themen und Diskussionen.,,WI,Winterthur,0,0
Weil ich gerne wenig lese und viel erfahre.,,WI,Winterthur,0,0
Verkürzt den Arbeitsweg.,,LU,Luzern,0,0
Keine Google Analytics.,,BE,Bern,0,0
Die Quellen sind verlinkt (sofern sie nicht geschützt werden müssen).,,WI,Winterthur,0,0
Auch mal unbequem (aber fundiert).,,BE,Bern,0,0
Weil die Republik keine Scheuklappen hat.,,LU,Luzern,0,0
Kompetenter und zuvorkommender Community-Support.,,SG,St. Gallen,0,0
Weil sie mir den Glauben an den Journalismus in der Schweiz zurückgegeben hat!,,LU,Luzern,0,0
Ausser der Republik braucht es keine «Zeitung» #news-diät.,,WI,Winterthur,0,0
"Weil ich wissen will, wie viel besser die Republik noch werden kann. ",,LU,Luzern,0,0
"Artikel als Ausgangspunkt zum Weiterforschen: Republik, mein Türöffner.",,LU,Luzern,0,0
Die Republik regt zum Handeln an. ,,BS,Basel,0,0
Fühle mich Ende Woche informiert.,,BS,Basel,0,0
"Bringt mich dazu, mich zu informieren (anstatt mich berieseln zu lassen).",,BE,Bern,0,0
Weil die Republik die Demokratie mit all ihren Facetten ernst nimmt und auch darüber berichtet (z. B. Rechtskolumne).,,BE,Bern,0,0
Weil die Schweiz nicht nur Mittelmass braucht.,,ZH,Zürich,0,0
"Beiträge sind auch verständlich, wenn ich nicht jeden Tag Zeitung lese. ",,SG,St. Gallen,0,0
"Aktueller und relevanter Journalismus, ohne Sensationsgeilheit.",,BE,Bern,0,0
Nicht nur Themen – auch Meinungsvielfalt.,,BE,Bern,0,0`)
/* eslint-enable no-irregular-whitespace */

export const getRandomReason = () => {
  const randomIndex = data
    .map((d, i) => [i, Math.random() * (1 + d.weight / 100)])
    .sort((a, b) => descending(a[1], b[1]))[0][0]

  const d = data[randomIndex]
  return {
    text: d.description,
    order: randomIndex,
    metadata: {
      originLong: d.originLong,
    },
  }
}
