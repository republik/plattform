module.exports = {
  option (voteOptionResult) {
    if (voteOptionResult.option) {
      return voteOptionResult.option
    }
    // old results (only) have id and name on the voteOptionResult, hoist
    if (voteOptionResult.id && voteOptionResult.name) {
      return {
        id: voteOptionResult.id,
        name: voteOptionResult.name
      }
    }
  }
}
