import path from 'path'
import Client from 'ssh2-sftp-client'

declare module 'tar' {
  class Parse {}
}

export async function getConnectedSftpClient(
  c: Client.ConnectOptions,
): Promise<Client> {
  const sftp = new Client()

  await sftp.connect(c)

  return sftp
}

export async function listSftpFiles(
  client: Client,
  basePath = './',
): Promise<string[]> {
  const directories = await client.list(basePath)

  const dirContents = (
    await Promise.all(
      directories
        .filter((file) => file.type === 'd')
        .map((f) => {
          return f
        })
        .filter((f) => f.name.match(/^[^.]/))
        .map(async (dir) => {
          const dirPath = path.join(basePath, dir.name)
          return listSftpFiles(client, dirPath)
        }),
    )
  ).flat()

  const camtFiles = await client
    .list(basePath, 'camt.053*')
    .then((fileInfos) => {
      return fileInfos.map((fileInfo) => {
        return path.join(basePath, fileInfo.name)
      })
    })
  return [...camtFiles, ...dirContents]
}

export interface SftpFile {
  fileName: string
  buffer: Buffer
}

export function loadSftpFiles({
  fileNames,
  client,
}: {
  fileNames: string[]
  client: Client
}): Promise<SftpFile[]> {
  return fileNames.reduce(
    async (promisePreviousResult: Promise<SftpFile[]>, fileName) => {
      const previousResult = await promisePreviousResult

      const buffer = (await client.get(fileName)) as Buffer

      return previousResult.concat({
        buffer,
        fileName,
      })
    },
    Promise.resolve([]),
  )
}
