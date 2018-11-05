module.exports = {
  async options (package_, args, {pgdb}) {
    const options =
      await pgdb.public.packageOptions.find({ packageId: package_.id })

    return options.map(option => ({
      ...option,
      // Stitch package payment methods to options
      paymentMethods: package_.paymentMethods
    }))
  }
}
