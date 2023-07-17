import createArticleSchema from '../Article'

const createAufDenPunktSchema = ({
  series = false,
  hasEmailTemplate = false,
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'adp-',
    hasEmailTemplate,
    series,
    ...args,
  })
}

export default createAufDenPunktSchema
