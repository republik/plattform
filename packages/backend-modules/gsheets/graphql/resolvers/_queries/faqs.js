module.exports = async (_, { locale }, { pgdb }) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly(
    { name: 'faqs' },
    'data',
  )
  if (!data) {
    return []
  }
  return data
    .filter((d) => d.published)
    .map((d) => ({
      category: d[`category_${locale}`],
      question: d[`question_${locale}`],
      answer: d[`answer_${locale}`],
    }))
}
