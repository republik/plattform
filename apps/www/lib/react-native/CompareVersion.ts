type SemanticVersion = {
  major: number
  minor: number
  patch: number
}

function validateVersion(version: string): boolean {
  const regex = /^\d+\.\d+\.\d+$/
  return regex.test(version)
}

function parseVersion(version: string): SemanticVersion {
  if (!validateVersion(version)) {
    throw new Error(`Invalid version: ${version}`)
  }

  const parts = version.split('.').map(Number)

  return {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
  }
}

/**
 * Compare to version1 to version2.
 * Versions must be provided as strings in the following pattern: `{major}.{minor}.{patch}`.
 * @param version1
 * @param version2
 * @return value < 0 if version1 < version2
 * @return value = 0 if version1 = version2
 * @return value > 0 if version1 > version2
 */
function compareVersion(version1: string, version2: string): number {
  const thisVersion = parseVersion(version1)
  const thatVersion = parseVersion(version2)

  if (thisVersion.major !== thatVersion.major) {
    return thisVersion.major - thatVersion.major
  }

  if (thisVersion.minor !== thatVersion.minor) {
    return thisVersion.minor - thatVersion.minor
  }

  return thisVersion.patch - thatVersion.patch
}

export default compareVersion
