module.exports = {
  // old results did only include id and name
  option (voteOptionResult) {
    if (voteOptionResult.id && voteOptionResult.name) {
      return { ...voteOptionResult }
    }
  }
}
