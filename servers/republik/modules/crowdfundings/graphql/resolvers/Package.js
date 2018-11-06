const { getCustomOptions } = require('../../lib/CustomPackages')

module.exports = {
  async options (package_, args, { pgdb, user: me }) {
    const options =
      await pgdb.public.packageOptions.find({ packageId: package_.id })

    // Get Custom Options for a package, evaluated via code.
    if (package_.custom === true) {
      return getCustomOptions(package_, options)
    }

    // Default, raw package options
    return options.map(
      option => ({
        ...option,
        templateId: option.id,
        package: package_
      })
    )
  }
}
