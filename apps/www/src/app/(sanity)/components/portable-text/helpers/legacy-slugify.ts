// Ported from https://observablehq.com/@republik/slug / @project-r/styleguide
// This is the function which was used to slugify headings. We cannot change it without breaking old links/table of contents
const diacritics = [
  { base: 'a', letters: ['â', 'à'] },
  { base: 'c', letters: ['ç'] },
  { base: 'e', letters: ['é', 'ê', 'è', 'ë'] },
  { base: 'i', letters: ['î', 'ï'] },
  { base: 'o', letters: ['ô'] },
  { base: 'u', letters: ['ù', 'û'] },
  { base: 'ss', letters: ['ß'] },
  { base: 'ae', letters: ['ä'] },
  { base: 'ue', letters: ['ü'] },
  { base: 'oe', letters: ['ö'] },
]

const diacriticsMap = diacritics.reduce((map, diacritic) => {
  diacritic.letters.forEach((letter) => {
    map[letter] = diacritic.base
  })
  return map
}, {})

export const legacySlugify = (string: string) =>
  string
    .toLowerCase()
    // eslint-disable-next-line no-control-regex
    .replace(/[^\u0000-\u007E]/g, (a) => diacriticsMap[a] || a)
    .replace(/[^0-9a-z]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
