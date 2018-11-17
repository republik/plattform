module.exports = {
  async options (package_, args, { pgdb, user: me }) {
    if (package_.options) {
      return package_.options
    }

    const packageOptions =
      await pgdb.public.packageOptions.find({ packageId: package_.id })

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
