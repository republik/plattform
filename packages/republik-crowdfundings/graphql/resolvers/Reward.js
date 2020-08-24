module.exports = {
  __resolveType (obj) {
    // obj is the entity from the DB and thus has the "rewardType" column used as FK
    return obj.rewardType
  }
}
