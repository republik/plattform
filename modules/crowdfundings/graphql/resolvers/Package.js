module.exports = {
  async options (package_, args, {pgdb}) {
    return pgdb.public.packageOptions.find({packageId: package_.id})
  }
}
