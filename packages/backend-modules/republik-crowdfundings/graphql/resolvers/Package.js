module.exports = {
  async company(package_, args, { pgdb }) {
    const company = pgdb.public.companies.findOne({ id: package_.companyId })

    // FIXME: resolve this properly
    return company.name === 'REPUBLIK' ? 'REPUBLIK_AG' : 'PROJECT_R'
  },
}
