module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  votings: [Voting!]!
  voting(slug: String!): Voting

  elections: [Election!]!
  election(slug: String!): Election

  questionnaires: [Questionnaire!]!
  questionnaire(slug: String!): Questionnaire
}

type mutations {
  createVoting(votingInput: VotingInput!): Voting!
  submitVotingBallot(
    votingId: ID!
    optionId: ID
  ): Voting!

  createElection(electionInput: ElectionInput!): Election!
  submitCandidacy(slug: String!): Candidacy!
  cancelCandidacy(slug: String!): Election!
  submitElectionBallot(
    electionId: ID!
    candidacyIds: [ID!]!
  ): Election!


  submitAnswer(answer: AnswerInput!): QuestionInterface!
  # delete all answers
  resetQuestionnaire(id: ID!): Questionnaire!
  submitQuestionnaire(id: ID!): Questionnaire!
}
`
