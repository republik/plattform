const diacritics = [
  {base: 'a', letters: ['ä', 'â', 'à']},
  {base: 'c', letters: ['ç']},
  {base: 'e', letters: ['é', 'ê', 'è', 'ë']},
  {base: 'i', letters: ['î', 'ï']},
  {base: 'o', letters: ['ö', 'ô']},
  {base: 'u', letters: ['ü', 'ù', 'û']},
  {base: 'ss', letters: ['ß']}
]

const diacriticsMap = diacritics.reduce(
  (map, diacritic) => {
    diacritic.letters.forEach(letter => {
      map[letter] = diacritic.base
    })
    return map
  },
  {}
)

const slug = string => string
  .toLowerCase()
  .replace(/[^\u0000-\u007E]/g, a => diacriticsMap[a] || a)
  .replace(/[^0-9a-z]+/g, ' ')
  .trim()
  .replace(/\s+/g, '-')

export default slug
