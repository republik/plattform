import { PaynotesQuery } from '#graphql/cms/__generated__/gql/graphql'

export type Paynote = PaynotesQuery['paynotes'][number]
