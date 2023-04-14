const { Analyzer } = require('../lib/credits/analyzer')

const cases = [
  {
    name: 'skip spaces',
    contributors: [
      { name: 'Claude Longchamp', kind: 'Text' },
      { name: 'Simon Schmid', kind: 'Text' },
    ],
    text: 'Von Claude  Longchamp und Simon Schmid, 19.10.2020',
  },
  {
    name: 'skip spaces #2',
    contributors: [{ name: 'Susanne Stühlinger', kind: 'Text' }],
    text: 'Von Susanne  Stühlinger , 27.01.2021',
  },
  {
    contributors: [{ name: 'Ihrem Expeditionsteam', kind: 'Text' }],
    text: 'Von Ihrem Expeditionsteam, 04.12.2020',
  },
  {
    name: 'mit',
    contributors: [
      { name: 'Barbara Bachmann', kind: 'Text' },
      { name: 'Ariel Hauptmeier', kind: 'Text' },
      { name: 'Adriana Loureiro Fernández', kind: 'Fotos' },
    ],
    text: 'Von Barbara Bachmann mit Ariel  Hauptmeier (Text) und Adriana Loureiro Fernández (Fotos), 30.01.2019',
  },
  {
    name: 'French credit line',
    contributors: [
      { name: 'Brigitte Hürlimann', kind: 'texte' },
      { name: 'QuickHoney', kind: 'illustrations' },
      { name: 'Anna Traussnig', kind: 'interactions' },
      { name: 'Marta Czarska', kind: 'traduction' },
    ],
    text: 'De Brigitte Hürlimann (texte), QuickHoney (illustrations), Anna Traussnig (interactions) et Marta Czarska (traduction), 13.02.2020',
  },
  {
    name: 'skip update',
    contributors: [
      { name: 'Daniel Binswanger', kind: 'Text' },
      { name: 'Daniel Graf', kind: 'Text' },
      { name: 'Patrick Recher', kind: 'Text' },
    ],
    text: 'Von Daniel Binswanger, Daniel Graf und Patrick Recher, 22.02.2020, Update: 12.03.2020',
  },
  {
    name: 'skip update 2',
    contributors: [
      { name: 'Elia Blülle', kind: 'Text' },
      { name: 'Anne Gabriel-Jürgens', kind: 'Bilder' },
    ],
    text: 'Eine Reportage von Elia Blülle (Text) und Anne Gabriel-Jürgens (Bilder), 08.03.2022, Update: 16.03.2022',
  },
  {
    name: 'skip update hour',
    contributors: [
      { name: 'Antje Stahl', kind: 'Text' },
      { name: 'Karla Hiraldo Voleau', kind: 'Bilder' },
    ],
    text: 'Von Antje Stahl (Text) und Karla Hiraldo Voleau (Bilder), 20.04.2022, Update um 11.00 Uhr',
  },
  {
    name: 'skip last update',
    contributors: [{ name: 'Ihrem Expeditionsteam', kind: 'Text' }],
    text: 'Von Ihrem Expeditionsteam, 11.05.2022, letztes Update: 24.11.2020',
  },
  {
    name: 'double credit',
    contributors: [
      { name: 'Lesha Berezovskiy', kind: 'Text und Bilder' },
      { name: 'Annette Keller', kind: 'Bildredaktion und Übersetzung' },
    ],
    text: 'Von Lesha Berezovskiy (Text und Bilder) und Annette Keller (Bildredaktion und Übersetzung), 18.05.2022',
  },
  {
    name: 'allow XX in dates for drafts',
    contributors: [{ name: 'Solmaz Khorsand', kind: 'Text' }],
    text: 'Von Solmaz Khorsand, XX.XX.2022',
  },
  {
    name: 'allow XY in dates for drafts',
    contributors: [
      { name: 'Philipp Albrecht', kind: 'Text' },
      { name: 'Andrea Ventura', kind: 'Illustration' },
    ],
    text: 'Von Philipp Albrecht (Text) und Andrea Ventura (Illustration), XY.05.2022',
  },
  {
    name: 'ignore undeclared characters',
    contributors: [],
    text: '[COUNTER AKTUELLER MITGLIEDERZAHL]',
  },
  {
    name: 'ignore undeclared characters (contains "by" indicator MIT)',
    contributors: [{ name: 'AKTUELLER MITGLIEDERZAHL', kind: 'Text' }],
    text: '[COUNTER MIT AKTUELLER MITGLIEDERZAHL]',
  },
  {
    name: 'ignore lingering parenthesis',
    contributors: [{ name: 'Brigitte Hürlimann', kind: 'Text' }],
    text: 'Von Brigitte Hürlimann (, 01.04.2023',
  },
]

describe('Analyzer', () => {
  cases.forEach(({ text, name, contributors }) => {
    test(`getAnalysis contributors case ${name}`, () => {
      expect(new Analyzer().getAnalysis(text).contributors).toEqual(
        contributors,
      )
    })
  })
})

// // Pae Collection of not supported cases
// // Some should probably be fixed at the source, others could be supported.
// const unclearCases = [
//   {
//     contributors: [
//       { name: 'Jurczok 1001', kind: 'Text' },
//     ],
//     text: 'Von Jurczok 1001, 07.05.2021'
//   },
//   {
//     name: 'ampersand',
//     contributors: [
//       { name: 'Adrienne Fichter', kind: 'Text' },
//       { name: 'Adam Broomberg', kind: 'Bilder' },
//       { name: 'Oliver Chanarin', kind: 'Bilder' },
//     ],
//     text: 'Von Adrienne Fichter (Text) und Adam Broomberg & Oliver Chanarin (Bilder), 05.07.2018',
//   },
//   {
//     name: 'ampersand single word name',
//     contributors: [
//       { name: 'Michael Rüegg', kind: 'Text' },
//       { name: 'Mrzyk', kind: 'Illustration' },
//       { name: 'Moriceau', kind: 'Illustration' },
//     ],
//     text: 'Von Michael Rüegg (Text) und Mrzyk & Moriceau (Illustration), 28.08.2018',
//   },
//   {
//     name: 'skip ?',
//     contributors: [
//       { name: 'Daniel Meyer', kind: 'Text' },
//     ],
//     text: 'Von Republik-Korrektor Daniel Meyer, 07.07.2020',
//   },
//   {
//     name: 'skip article (grammar)',
//     contributors: [
//       { name: 'Republik-Redaktion', kind: 'Text' },
//     ],
//     text: 'Von der Republik-Redaktion, 27.09.2019',
//   },
//   {
//     name: 'skip article (grammar)',
//     contributors: [
//       { name: 'Republik-Jury', kind: 'Text' },
//     ],
//     text: 'Von der Republik-Jury, 13.06.2019',
//   },
//   {
//     case: 'mit dem',
//     contributors: [
//       { name: 'Franziska Engelhardt', kind: 'Regie' },
//       { name: 'Kollektiv Fennek', kind: 'Regie' },
//       { name: 'Daniel Hobi', kind: 'Musik' },
//       { name: 'Flavio Leone', kind: 'Bilder' },
//     ],
//     text: 'Von Franziska Engelhardt mit dem Kollektiv Fennek (Regie), Daniel Hobi (Musik) und Flavio Leone (Bilder), 25.12.2020',
//   },
//   {
//     name: 'company in',
//     contributors: [
//       { name: '', kind: 'Text' },
//       { name: '', kind: 'Text' },
//     ],
//     text: 'Von Jonathan Mahler, Jim Rutenberg («New York Times Magazine», Text), Anne Vonderstein (Übersetzung) und Joan Wong (Illustrationen), 31.05.2019',
//   },
//   {
//     contributors: [
//       { name: 'Franziska Grillmeier', kind: 'Aufgezeichnet' },
//       { name: 'Christian Grund', kind: 'Bilder' },
//     ],
//     text: 'Aufgezeichnet von Franziska Grillmeier, Bilder von Christian Grund, 16.03.2019',
//   },
//   {
//     contributors: [
//       { name: 'Lili Loofbourow', kind: 'Text' },
//       { name: 'Oliver Fuchs', kind: 'Übersetzung' },
//     ],
//     text: 'Von Lili Loofbourow (Text) und Oliver Fuchs (Übersetzung), mit Bildern von Jörg Brüggemann (Ostkreuz), 02.11.2019',
//   },
//   {
//     name: 'unclear kinds',
//     contributors: [
//       { name: 'Thomas Preusse', kind: 'Text' },
//       { name: 'Hanna Wick', kind: 'Text' },
//       { name: 'Daryl Lindsey', kind: 'Translation' },
//       { name: 'Charles Hawley', kind: 'Translation' },
//     ],
//     text: 'By Thomas Preusse, Hanna Wick, Daryl Lindsey and Charles Hawley (Translation), 25.06.2018',
//   },
//   {
//     contributors: [
//       { name: 'Elia Blülle', kind: 'Abschlussprojekt' },
//       { name: 'Adelina Gashi', kind: 'Abschlussprojekt' },
//       { name: 'Michael Kuratli', kind: 'Abschlussprojekt' },
//       { name: 'Isabelle Schwab', kind: 'Abschlussprojekt' },
//     ],
//     text: 'Das Abschlussprojekt der Republik-Trainees Elia Blülle, Adelina Gashi, Michael Kuratli, Isabelle Schwab, 04.03.2019',
//   },
//   {
//     contributors: [
//       { name: 'Andreas Moor', kind: 'Text' },
//       { name: 'Simon Schmid', kind: 'Text' },
//       { name: 'Niels Blaesi', kind: 'Illustrationen' },
//     ],
//     text: 'Von Andreas Moor und Simon Schmid, Illustrationen von Niels Blaesi, 09.01.2020',
//   },
//   {
//     name: 'unclear how to deal with guests',
//     contributors: [
//       { name: 'Thom Nagy', kind: 'Moderation' },
//       { name: 'Adrienne Fichter', kind: 'Gast' },
//     ],
//     text: 'Von Thom Nagy (Moderation), mit Adrienne Fichter, 13.02.2018',
//   },
//   {
//     name: 'English byline',
//     contributors: [
//       { name: 'Sylke Gruhnwald', kind: 'Text' },
//       { name: 'Carlos Hanimann', kind: 'Text' },
//       { name: 'Grit Hartmann', kind: 'Text' },
//       { name: 'Jürgen Kleinschnitger', kind: 'Text' },
//       { name: 'Hajo Seppelt', kind: 'Text' },
//       { name: 'Florian Wicki', kind: 'Text' },
//       { name: 'Edmund Willison', kind: 'Text' },
//       { name: 'Charles Hawley', kind: 'Translated' },
//     ],
//     text: 'By Sylke Gruhnwald, Carlos Hanimann, Grit Hartmann, Jürgen Kleinschnitger, Hajo Seppelt, Florian Wicki and Edmund Willison. Translated by Charles Hawley, February 21, 2018',
//   },
//   {
//     name: 'French credit line short «de»',
//     contributors: [
//       { name: 'Adrienne Fichter', kind: 'texte' },
//       { name: 'Kwennie Cheng', kind: 'illustration' },
//       { name: 'Christelle Konrad', kind: 'traduit' },
//     ],
//     text: 'Une recherche d’Adrienne Fichter (texte) et Kwennie Cheng (illustration), traduit par Christelle Konrad, 23.07.2019',
//   },
//   {
//     name: 'without by word',
//     contributors: [
//       { name: 'Elia Blülle', kind: 'Text' },
//     ],
//     text: 'Elia Blülle, 05.04.2018',
//   },
//   {
//     name: 'missing text declaration',
//     contributors: [
//       { name: 'Solmaz Khorsand', kind: 'Text' },
//       { name: 'Anthony Gerace', kind: 'Illustration' },
//     ],
//     text: 'Eine Reportage von Solmaz Khorsand und Anthony Gerace (Illustration), 05.05.2020',
//   },
// ]
