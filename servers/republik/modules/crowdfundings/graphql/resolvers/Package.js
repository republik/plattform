const { getCustomOptions } = require('../../lib/CustomPackages')

module.exports = {
  async options (package_, args, { pgdb, user: me }) {
    const packageOptions =
      await pgdb.public.packageOptions.find({ packageId: package_.id })

    // Get Custom Options for a package, evaluated via code.
    if (package_.custom === true) {
      Object.assign(package_, { packageOptions })
      return getCustomOptions(package_)
    }

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
