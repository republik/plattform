const bodyParser = require('body-parser')

module.exports = (server, pgdb, t, redis, context) => {
  // Callback for assets which are ready
  server.get(
    '/publikator/syntheticReadAloud/lexicon',
    bodyParser.json(),
    async (req, res) => {
      const { pgdb } = context

      // @example [{"alias":"By the way","phoneme":null,"grapheme":"BTW"},{"phoneme":"ha.loːˈ","grapheme":"Hello"}]
      const lexicon = await pgdb.public.gsheets.findOneFieldOnly(
        { name: 'syntheticReadAloudLexicon' },
        'data',
      )
      if (!lexicon) {
        return res.status(204).end()
      }

      // "custom lexicon to improve pronunciation"
      // @see https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup?tabs=csharp#use-custom-lexicon-to-improve-pronunciation
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<lexicon xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.w3.org/2005/01/pronunciation-lexicon http://www.w3.org/TR/2007/CR-pronunciation-lexicon-20071212/pls.xsd" version="1.0" alphabet="ipa" xml:lang="de-DE" xmlns="http://www.w3.org/2005/01/pronunciation-lexicon">
      ${lexicon
        .map(({ grapheme, phoneme, alias }) => {
          if (grapheme && phoneme) {
            return `<lexeme><grapheme>${grapheme}</grapheme><phoneme>${phoneme}</phoneme></lexeme>`
          }

          if (grapheme && alias) {
            return `<lexeme><grapheme>${grapheme}</grapheme><alias>${alias}</alias></lexeme>`
          }
        })
        .filter(Boolean)
        .join('')}</lexicon>`

      res.type('application/xml').send(xml)
    },
  )

  server.get(
    '/publikator/syntheticReadAloud/substitution',
    bodyParser.json(),
    async (req, res) => {
      const { pgdb } = context
      const substitution = await pgdb.public.gsheets.findOneFieldOnly(
        { name: 'syntheticReadAloudSubstitution' },
        'data',
      )
      if (!substitution) {
        return res.status(204).end()
      }

      res.json(substitution)
    },
  )
}
