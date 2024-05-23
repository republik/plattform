import { pipeline } from 'node:stream/promises'
import { execSync, spawn } from 'node:child_process'
import { mkdir, stat } from 'node:fs/promises'
import * as tar from 'tar'

const PACK_GITHUB_URL = 'https://github.com/buildpacks/pack/releases/download'
const PACK_VERSION = 'v0.33.2'

function getOSName() {
  switch (process.platform) {
    case 'darwin':
      return 'macos'
    // support for other operating systems can be added later
    default:
      throw new Error('unsupported os')
  }
}

async function fileExists(path) {
  const res = await stat(path).catch(() => false)
  return res
}

async function downloadPack() {
  const OS_NAME = getOSName()
  const CPU_ARCH = process.arch
  const tarfile = `pack-${PACK_VERSION}-${OS_NAME}-${CPU_ARCH}.tgz`
  const url = `${PACK_GITHUB_URL}/${PACK_VERSION}/${tarfile}`

  const DOWNLOAD_DIR = new URL('./bin', import.meta.url)
  console.log(DOWNLOAD_DIR.pathname)

  if (!(await fileExists(DOWNLOAD_DIR.pathname))) {
    console.error('mkdir %s', DOWNLOAD_DIR.pathname)
    await mkdir(DOWNLOAD_DIR)
  }

  if (await fileExists(DOWNLOAD_DIR.pathname + '/pack')) {
    console.error('pack already downloaded')
    return DOWNLOAD_DIR.pathname + '/pack'
  }

  console.error('Downloading %s', url)
  const res = await fetch(url)
  if (!res.ok) {
    console.error(res.statusText)
    throw new Error('failed to download package')
  }
  if (!res.body) {
    throw new Error('response body is empty')
  }

  console.error('Extrackting pack into %s', DOWNLOAD_DIR)
  await pipeline(res.body, tar.x({ cwd: DOWNLOAD_DIR.pathname }))

  console.error('Done downloading pack')

  return DOWNLOAD_DIR.pathname + '/pack'
}

function locate(name) {
  try {
    const path = execSync(`which ${name}`)
    return path.toString('utf8').trim()
  } catch (error) {
    return false
  }
}

async function resolveDefaultAppEnvFile(appName) {
  const envFile = new URL(`./../../apps/${appName}/.env`, import.meta.url)
  if (!(await stat(envFile))) {
    throw new Error('app .env file is missing')
  }
  return envFile.pathname
}

function buildEnvFromArgs(argv) {
  const idx = argv.indexOf('--env-file')
  if (idx === -1) {
    return null
  }
  return argv[idx + 1] ?? null
}

function buildCNBContainer(packPath, app, envFile, controller) {
  const args = [
    'build',
    `${app}-republik-test:latest`,
    '--descriptor',
    'packages/container-builder/cnb_project.toml',
    '--env',
    `SERVER=${app}`,
    `--env-file=${envFile}`,
  ]
  const cmd = spawn(packPath, args, {
    signal: controller ? controller.signal : undefined,
  })

  return cmd
}

const SUPPORTED_APPS = ['www', 'api', 'assets', 'admin', 'publikator'].sort()

async function main() {
  const app = process.argv[2] ?? null
  if (!app) {
    console.error(
      'You need to provide an app to build (%s)',
      SUPPORTED_APPS.join('|'),
    )
    process.exit(1)
  }
  if (!SUPPORTED_APPS.includes(app)) {
    console.error('Unsupported app: %s', app)
    process.exit(1)
  }

  let packPath = locate('pack')
  if (!packPath) {
    packPath = await downloadPack()
  } else {
    const version = execSync('pack version').toString().trim()
    console.error('Using user installed version of pack [v%s]', version)
  }

  try {
    const envFile =
      buildEnvFromArgs(process.argv) || (await resolveDefaultAppEnvFile(app))
    const controller = new AbortController()

    const job = buildCNBContainer(packPath, app, envFile, controller)

    process.on('SIGINT', () => {
      controller.abort()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      controller.abort()
      process.exit(0)
    })

    process.stdin.pipe(job.stdin)
    job.stdout.pipe(process.stdout)
  } catch (err) {
    console.error(err)
  }
}

main()
