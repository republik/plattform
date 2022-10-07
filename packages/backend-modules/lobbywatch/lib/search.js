const { descending } = require('d3-array')
const api = require('./api')
const mappers = require('./mappers')

const diacritics = [
  { base: 'a', letters: ['ä', 'â', 'à'] },
  { base: 'c', letters: ['ç'] },
  { base: 'e', letters: ['é', 'ê', 'è', 'ë'] },
  { base: 'i', letters: ['î', 'ï'] },
  { base: 'o', letters: ['ö', 'ô'] },
  { base: 'u', letters: ['ü', 'ù', 'û'] },
  { base: 'ss', letters: ['ß'] },
]

const diacriticsMap = diacritics.reduce((map, diacritic) => {
  for (const letter of diacritic.letters) {
    map[letter] = diacritic.base
  }
  return map
}, {})

const normalize = (keyword) =>
  keyword
    .toLowerCase() // eslint-disable-next-line no-control-regex
    .replace(/[^\u0000-\u007E]/g, (a) => diacriticsMap[a] || a)
const cleanKeywords = (keywords) =>
  keywords.filter(Boolean).map((keyword) => normalize(keyword))

const BOOSTS = {
  Parliamentarian: 1,
  Guest: 0.5,
  Organisation: 0,
  LobbyGroup: 0,
  Branch: 0,
}

module.exports.loadSearch = (locales) => {
  return Promise.all(
    locales.map((locale) => {
      return Promise.all([
        api.data(
          locale,
          'data/interface/v1/json/table/parlamentarier/flat/list',
          {
            select_fields: [
              'parlament_number',
              'vorname',
              'zweiter_vorname',
              'nachname',
              'beruf',
              'geschlecht',
              'geburtstag',
              'parteifunktion',
              'partei_name',
              'partei_name_fr',
              'partei',
              'partei_fr',
              'kanton_name_de',
              'kanton_name_fr',
              'ratstyp',
              'aktiv',
              'im_rat_bis_unix',
              'im_rat_seit_unix',
              'kommissionen_namen_de',
              'kommissionen_namen_fr',
              'kommissionen_abkuerzung_de',
              'kommissionen_abkuerzung_fr',
            ].join(','),
          },
        ),
        api.data(
          locale,
          'data/interface/v1/json/table/zutrittsberechtigung/flat/list',
          {
            select_fields: [
              'id',
              'vorname',
              'nachname',
              'beruf',
              'geschlecht',
              'funktion',
              'zweiter_vorname',
              'bis_unix',
            ].join(','),
          },
        ),
        api.data(
          locale,
          'data/interface/v1/json/table/interessengruppe/flat/list',
        ),
        api.data(locale, 'data/interface/v1/json/table/branche/flat/list'),
        api.data(
          locale,
          'data/interface/v1/json/table/organisation/flat/list',
          {
            select_fields: [
              'name_de',
              'name_fr',
              'rechtsform',
              'ort',
              'abkuerzung_de',
              'abkuerzung_fr',
              'interessengruppe_de',
              'interessengruppe_fr',
              'interessengruppe_id',
              'interessengruppe2_de',
              'interessengruppe2_fr',
              'interessengruppe2_id',
              'interessengruppe3_de',
              'interessengruppe3_fr',
              'interessengruppe3_id',
              'uid',
              'alias_namen_de',
              'alias_namen_fr',
            ].join(','),
          },
        ),
      ]).then(
        ([
          {
            json: { data: parliamentarians },
          },
          {
            json: { data: guests },
          },
          {
            json: { data: lobbyGroups },
          },
          {
            json: { data: branchs },
          },
          {
            json: { data: organisations },
          },
        ]) => {
          const index = parliamentarians
            .map((parliamentarian) => ({
              type: 'Parliamentarian',
              raw: parliamentarian,
              keywords: cleanKeywords([
                parliamentarian.nachname,
                parliamentarian.vorname,
                parliamentarian.zweiter_vorname,
                parliamentarian.kanton_name,
                parliamentarian.partei,
                ...(parliamentarian.kommissionen_abkuerzung
                  ? parliamentarian.kommissionen_abkuerzung.split(',')
                  : []),
                ...(parliamentarian.kommissionen_namen
                  ? parliamentarian.kommissionen_namen.split(';')
                  : []),
              ]),
            }))
            .concat(
              guests.map((guest) => ({
                type: 'Guest',
                raw: guest,
                keywords: cleanKeywords([
                  guest.nachname,
                  guest.vorname,
                  guest.zweiter_vorname,
                  guest.funktion,
                ]),
              })),
            )
            .concat(
              lobbyGroups.map((lobbyGroup) => ({
                type: 'LobbyGroup',
                raw: lobbyGroup,
                keywords: cleanKeywords([
                  lobbyGroup.name,
                  ...(lobbyGroup.alias_namen
                    ? lobbyGroup.alias_namen.split(';')
                    : []),
                  lobbyGroup.branche,
                  lobbyGroup.kommission1_abkuerzung,
                  lobbyGroup.kommission2_abkuerzung,
                  lobbyGroup.kommission1,
                  lobbyGroup.kommission2,
                ]),
              })),
            )
            .concat(
              branchs.map((branch) => ({
                type: 'Branch',
                raw: branch,
                keywords: cleanKeywords([branch.name]),
              })),
            )
            .concat(
              organisations.map((organisation) => ({
                type: 'Organisation',
                raw: organisation,
                keywords: cleanKeywords([
                  organisation.name,
                  organisation.uid,
                  organisation.abkuerzung,
                  ...(organisation.alias_namen
                    ? organisation.alias_namen.split(';')
                    : []),
                  organisation.interessengruppe,
                  organisation.interessengruppe2,
                  organisation.interessengruppe3,
                ]),
              })),
            )

          return (term, t) => {
            if (term.length === 0) {
              return []
            }

            const terms = term
              .split(/\s+/)
              .map((term) => normalize(term.trim()))
              .filter(Boolean)
            return index
              .map((item) => {
                let matchedTerms = 0
                const match = item.keywords.reduce(
                  (sum, keyword, keywordIndex) => {
                    for (const term of terms) {
                      const index = keyword.indexOf(term)
                      if (index !== -1) {
                        matchedTerms += 1
                        let score = term === keyword ? 24 : 12
                        score /= index + 1
                        score -= keywordIndex
                        sum += Math.max(score, 0)
                      }
                    }
                    return sum
                  },
                  0,
                )
                if (matchedTerms >= terms.length && match > 0) {
                  return [match + BOOSTS[item.type], item]
                }
              })
              .filter(Boolean)
              .sort((a, b) => descending(a[0], b[0]))
              .slice(0, 30)
              .map((d) => {
                return mappers[`map${d[1].type}`](d[1].raw, t)
              })
          }
        },
      )
    }),
  )
}
