module.exports = {
  async company (package_, args, { pgdb }) {
    return pgdb.public.companies.findOne(
      { id: package_.companyId }
    )
  },
  async options (package_, args, { pgdb }) {
    if (package_.options) {
      return package_.options
    }

    const packageOptions =
      await pgdb.public.packageOptions.find(
        { packageId: package_.id, disabled: false },
        { orderBy: { order: 'asc' } }
      )

    // Default, raw package options
    return packageOptions.map(
      packageOption => ({
        ...packageOption,
        templateId: packageOption.id,
        package: package_
      })
    )
  }
}
