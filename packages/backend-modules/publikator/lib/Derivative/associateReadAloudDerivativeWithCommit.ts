import { PgDb } from 'pogi'
import { Commit, DerivativeRow } from '../types'

export async function associateReadAloudDerivativeWithCommit(
  derivative: DerivativeRow,
  commit: Commit,
  pgdb: PgDb,
) {
  const tx = await pgdb.transactionBegin()
  try {
    const existingCommitWithSynthReadAloud =
      await tx.publikator.commitsWithSynthReadAloud.find({
        commitId: commit.id,
      })
    if (existingCommitWithSynthReadAloud && existingCommitWithSynthReadAloud.length > 0) {
      await tx.publikator.commitsWithSynthReadAloud.updateAndGetOne({commitId: commit.id}, {
        derivativeId: derivative.id,
        updatedAt: new Date(),
      })
    } else {
      await tx.publikator.commitsWithSynthReadAloud.insertAndGet({
        derivativeId: derivative.id,
        commitId: commit.id,
      })
      await tx.transactionCommit()
    }
  } catch (e) {
    console.error('Error while associating commit %s with derivative %s: %s', commit?.id, derivative?.id, e)
    await tx.transactionRollback()
  }
}
