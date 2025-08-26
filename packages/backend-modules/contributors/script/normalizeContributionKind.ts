import { ContributionKind } from '../types'

const elasticKindToContributionKindMap: Map<string, ContributionKind> = new Map(
  [
    // text and editing
    ['text', 'text'],
    ['texte', 'text'],
    ['interview', 'text'],
    ['interviews', 'text'],
    ['redaktion', 'editing'],
    ['gespräch', 'text'],
    ['antworten', 'text'],
    ['begleittext', 'text'],
    ['gedichte', 'text'],
    ['originalgedichte', 'text'],
    ['«new york times magazine», text', 'text'],
    ['«guardian», text', 'text'],
    ['«bajour», text', 'text'],
    ['«bajour»', 'text'],
    ['editor', 'editing'],
    ['miterarbeit', 'text'],
    ['bearbeitung', 'editing'],

    ['reporters united', 'text'],
    ['«correctiv»', 'text'],
    ['investigate europe', 'text'],
    ['zdf', 'text'],

    // pictures
    ['bilder', 'picture'],
    ['bild', 'picture'],
    ['photos', 'picture'],
    ['photo', 'picture'],
    ['porträts', 'picture'],
    ['photography', 'picture'],
    ['fotos', 'picture'],
    ['bildschirmfotos', 'picture'],

    // illus and art
    ['illustration', 'illustration'],
    ['illustrationen', 'illustration'],
    ['illustrations', 'illustration'],
    ['kunst', 'illustration'],
    ['art', 'illustration'],

    // translation
    ['translation', 'translation'],
    ['übersetzung', 'translation'],
    ['traduction', 'translation'],
    ['übersetzung aus dem englischen', 'translation'],

    // recherche
    ['recherche', 'research'],
    ['vorrecherche', 'research'], // Preliminary research

    // production
    ['producer', 'production'],
    ['produktion', 'production'],
    ['umsetzung', 'production'],
    ['realisation', 'production'],
    ['regie', 'production'],
    ['aufnahme', 'production'],
    ['audioproduktion', 'production'],

    // voice, audio, sounds
    ['voice', 'voice'], // Spezifisch Sprecher*innen
    ['rezitation', 'audio'],
    ['podcast', 'audio'],
    ['gast', 'audio'],
    ['gäste', 'audio'],
    ['hosts', 'audio'],
    ['sound', 'sound'],
    ['musik', 'sound'],
    ['klang', 'sound'],
    ['audio', 'audio'],
    ['moderation', 'audio'],

    // video
    ['video', 'video'],
    ['videos', 'video'],
    ['film', 'video'],

    // design?
    ['design', 'design'],
    ['interaktion', 'design'],
    ['interactions', 'design'],
    ['logo', 'design'],

    // animationen
    ['animation', 'animation'],
    ['animationen', 'animation'],
    ['interaktive umsetzung', 'animation'],

    // data and charts
    ['datenanalyse', 'data_analysis'],
    ['datenauswertung', 'data_analysis'],
    ['analyse', 'data_analysis'],
    ['visualisierung', 'charts'],
    ['infografik', 'charts'],
    ['infografiken', 'charts'],
    ['grafik', 'charts'],
    ['grafiken', 'charts'],

    // konzept
    ['konzeption', 'concept'],
    ['konzept', 'concept'],
    ['idee', 'concept'],
    ['idea', 'concept'],

    ['ostkreuz', 'other'],
    ['rezept', 'other'],
    ['foodstyling', 'other'],
    ['quiz', 'other'],
  ],
)

export function normalizeContributionKind(
  input: string | undefined,
): ContributionKind[] {
  if (typeof input !== 'string' || input.trim() === '') {
    return ['other']
  }

  const normalizedInput = input.trim().toLowerCase()
  const foundKinds: Set<ContributionKind> = new Set()

  // Check for common separators: "und", "and", "/"
  // Split the string by "und", "and", or "/" (case-insensitive)
  const parts = normalizedInput
    .split(/\s*(und|and|\/)\s*/)
    .filter((part) => part && part !== 'und' && part !== 'and' && part !== '/')

  parts.forEach((part) => {
    // get normalized contribution kind
    const kind = elasticKindToContributionKindMap.get(part) || 'other'
    foundKinds.add(kind)
  })

  // If no specific kinds were found, default to 'other'
  if (foundKinds.size === 0) {
    return ['other']
  }

  const finalKinds = Array.from(foundKinds)
  return finalKinds
}
