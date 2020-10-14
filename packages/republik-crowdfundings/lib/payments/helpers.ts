import { PgDb } from 'pogi'

export async function getAmountOfUnmatchedPayments(
  pgdb: PgDb,
): Promise<number> {
  return (await pgdb.queryOneField(
    'select count(*) from "postfinancePayments" where matched = false and hidden is not true;',
  )) as number
}
