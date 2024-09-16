import { PaynotesQuery } from '#graphql/cms/__generated__/gql/graphql'

export type Paynotes = {
  paynote: PaynotesQuery['paynoteConfig']['paynotes'][number]
  miniPaynote: PaynotesQuery['paynoteConfig']['miniPaynotes'][number]
}
