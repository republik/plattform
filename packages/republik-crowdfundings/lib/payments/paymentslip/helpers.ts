import { PgDb } from 'pogi'
export const PAYMENT_DEADLINE_DAYS = 30
export async function getAmountOfUnmatchedPayments(
  pgdb: PgDb,
): Promise<number> {
  return (await pgdb.queryOneField(
    'select count(*) from "postfinancePayments" where matched = false and hidden is not true;',
  )) as number
}
export async function getLatestImportSecondsAgo(
  pgdb: PgDb,
): Promise<number> {
  // Return max importedAt date in seconds
  return (await pgdb.queryOneField(
    'select extract(epoch from now() - max("importedAt"))::int from "postfinanceImports";',
  )) as number
}
