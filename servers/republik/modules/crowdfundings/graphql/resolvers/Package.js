module.exports = {
  async company (package_, args, { pgdb }) {
    return pgdb.public.companies.findOne(
      { id: package_.companyId }
    )
  }
}
