import { PgDb, PgTable } from 'pogi'

import { listSftpFiles, loadSftpFiles, getConnectedSftpClient } from './sftp'

export async function syncPaymentFiles(transaction: PgDb): Promise<void> {
  const files = await getNewFilesFromAllServers(transaction)
  await postfinanceImportsTable(transaction).insert(files)
  return
}

async function getNewFilesFromAllServers(transaction: PgDb) {
  const serverFiles = await Promise.all(
    serverConnectionOptions.map(getNewFilesFromServer(transaction)),
  )
  return serverFiles.flat()
}
interface SftpConnectionOptions {
  host: string
  port: number
  username: string
  privateKey: string
}

const { PF_SFTP_CONNECTIONS } = process.env

let serverConnectionOptions: SftpConnectionOptions[] = []
if (PF_SFTP_CONNECTIONS) {
  try {
    serverConnectionOptions = JSON.parse(PF_SFTP_CONNECTIONS)
  } catch (e) {
    console.warn(
      'invalid PF_SFTP_CONNECTIONS env, no payments will be imported',
      PF_SFTP_CONNECTIONS,
    )
  }
}

function postfinanceImportsTable(transaction: PgDb) {
  return transaction.public.postfinanceImports as PgTable<
    PostfinanceImportsRecord
  >
}

interface PostfinanceImportsRecord {
  fileName: string
  buffer: Buffer
  isImported?: boolean
}

function getNewFilesFromServer(transaction: PgDb) {
  return async function (connectionOptions: SftpConnectionOptions) {
    const sftpClient = await getConnectedSftpClient(connectionOptions)

    try {
      const fileNamesOnServer = await listSftpFiles(sftpClient)

      const fileNamesToLoad = await filterPreviouslyLoadedFiles({
        transaction,
        fileNames: fileNamesOnServer,
      })

      return await loadSftpFiles({
        fileNames: fileNamesToLoad,
        client: sftpClient,
      })
    } finally {
      sftpClient.end()
    }
  }
}

async function filterPreviouslyLoadedFiles({
  fileNames,
  transaction,
}: {
  fileNames: string[]
  transaction: PgDb
}) {
  if (fileNames.length === 0) {
    return []
  }

  const records = await postfinanceImportsTable(transaction).find({
    fileName: fileNames,
  })

  const set = new Set(fileNames)
  records.forEach((record) => {
    set.delete(record.fileName)
  })

  return Array.from(set)
}
