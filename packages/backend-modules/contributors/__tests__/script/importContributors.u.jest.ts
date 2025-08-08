import { UserRow } from '@orbiting/backend-modules-types'
import { importContributorsFunctions } from '../../script/importContributors'
import { Contributor, GsheetAuthorGender } from '../../types'
const {
  extractS3KeyFromUrl,
  filterForExistingContributors,
  associateContributorWithProfileData,
  getGenderFromGsheetData,
  findDuplicates,
} = importContributorsFunctions

describe('find duplicates in array', () => {
  test('no duplicates', () => {
    const arrayWithoutDuplicates = ['abc', 'cde', 'def']
    const duplicates = findDuplicates(arrayWithoutDuplicates)
    expect(duplicates).toHaveLength(0)
  })

  test('some duplicates', () => {
    const arrayWithDuplicates = ['abc', 'abc', 'def', 'def', 'cde']
    const duplicates = findDuplicates(arrayWithDuplicates)
    expect(duplicates).toHaveLength(2)
    expect(duplicates).toEqual(['abc', 'def'])
  })
})

describe('test extract S3 key from URL function', () => {
  const bucket = 'my-test-bucket'

  test('should extract key from URL with /s3/ prefix and bucket name', () => {
    const url = `https://assets.example.com/s3/${bucket}/path/to/image.jpg`
    expect(extractS3KeyFromUrl(url, bucket)).toBe('path/to/image.jpg')
  })

  test('should extract key from URL without /s3/ prefix but with bucket name', () => {
    const url = `https://assets.example.com/${bucket}/another/image.png`
    expect(extractS3KeyFromUrl(url, bucket)).toBe('another/image.png')
  })

  test('should extract key from URL with just key after bucket', () => {
    const url = `https://assets.example.com/${bucket}/file.gif`
    expect(extractS3KeyFromUrl(url, bucket)).toBe('file.gif')
  })

  test('should decode URL components', () => {
    const url = `https://assets.example.com/${bucket}/path/to%20encoded%20file.jpeg`
    expect(extractS3KeyFromUrl(url, bucket)).toBe('path/to encoded file.jpeg')
  })

  test('should extract full pathname if bucket not found in path', () => {
    const url = `https://assets.example.com/some/other/path/image.jpg`
    expect(extractS3KeyFromUrl(url, bucket)).toBe('some/other/path/image.jpg')
  })

  test('should extract full pathname also with query params', () => {
    const url = `https://assets.example.com/${bucket}/another/image.png?size=1200x450`
    expect(extractS3KeyFromUrl(url, bucket)).toBe('another/image.png')
  })

  test('should throw an error for an invalid URL', () => {
    const invalidUrl = 'not-a-valid-url'
    expect(() => extractS3KeyFromUrl(invalidUrl, bucket)).toThrow()
  })

  test('should throw an error for an empty URL string', () => {
    const emptyUrl = ''
    expect(() => extractS3KeyFromUrl(emptyUrl, bucket)).toThrow()
  })
})

describe('filterForExistingContributors', () => {
  test('should return all contributors as new if DB is empty', async () => {
    const contributors: Contributor[] = [
      { name: 'Alice', slug: 'alice' },
      { name: 'Bob', slug: 'bob' },
    ]
    const contributorsinDb: Contributor[] = []
    const result = await filterForExistingContributors(
      contributors,
      contributorsinDb,
    )
    expect(result.newContributors).toEqual(contributors)
    expect(result.contributorsToPossiblyUpdate).toEqual([])
  })

  test('should return no new contributors if all exist in DB', async () => {
    const contributors: Contributor[] = [
      { name: 'Alice', slug: 'alice' },
      { name: 'Bob', slug: 'bob' },
    ]
    const contributorsinDb: Contributor[] = [
      { name: 'Alice', slug: 'alice' },
      { name: 'Bob', slug: 'bob' },
    ]
    const result = await filterForExistingContributors(
      contributors,
      contributorsinDb,
    )
    expect(result.newContributors).toEqual([])
    expect(result.contributorsToPossiblyUpdate).toEqual([])
  })

  test('should correctly separate new and existing contributors', async () => {
    const contributors: Contributor[] = [
      { name: 'Alice', slug: 'alice' },
      { name: 'Bob', slug: 'bob' },
      { name: 'Charlie', slug: 'charlie' },
    ]
    const contributorsinDb: Contributor[] = [{ name: 'Alice', slug: 'alice' }]
    const result = await filterForExistingContributors(
      contributors,
      contributorsinDb,
    )
    expect(result.newContributors).toEqual([
      { name: 'Bob', slug: 'bob' },
      { name: 'Charlie', slug: 'charlie' },
    ])
    expect(result.contributorsToPossiblyUpdate).toEqual([])
  })

  test('should identify contributors to possibly update, meaning those who exist in the DB but have no userId', async () => {
    const contributors: Contributor[] = [
      { name: 'Alice', slug: 'alice', user_id: 'user123' },
      { name: 'Bob', slug: 'bob' },
    ]
    const contributorsinDb: Contributor[] = [
      { name: 'Alice', slug: 'alice' }, // Alice exists but without user_id
      { name: 'Charlie', slug: 'charlie', user_id: 'user456' },
    ]
    const result = await filterForExistingContributors(
      contributors,
      contributorsinDb,
    )
    expect(result.newContributors).toEqual([{ name: 'Bob', slug: 'bob' }])
    expect(result.contributorsToPossiblyUpdate).toEqual([
      { name: 'Alice', slug: 'alice', user_id: 'user123' },
    ])
  })

  test('empty input contributors array', async () => {
    const contributors: Contributor[] = []
    const contributorsinDb: Contributor[] = [{ name: 'Alice', slug: 'alice' }]
    const result = await filterForExistingContributors(
      contributors,
      contributorsinDb,
    )
    expect(result.newContributors).toEqual([])
    expect(result.contributorsToPossiblyUpdate).toEqual([])
  })

  test('both arrays being empty', async () => {
    const contributors: Contributor[] = []
    const contributorsinDb: Contributor[] = []
    const result = await filterForExistingContributors(
      contributors,
      contributorsinDb,
    )
    expect(result.newContributors).toEqual([])
    expect(result.contributorsToPossiblyUpdate).toEqual([])
  })
})

describe('associateContributorWithProfileData', () => {
  // only test users without portraitUrl, so that copyProfileImage is not called
  test('should associate all profile data when user is found and data is present', async () => {
    const userMap = new Map<string, any>([
      [
        'user123',
        {
          id: 'user123',
          biography: 'A test bio.',
          prolitterisId: 'PL123',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'männlich',
        },
      ],
    ])
    const contributor: Contributor = {
      name: 'John Doe',
      slug: 'john-doe',
      user_id: 'user123',
    }

    const updatedContributor = await associateContributorWithProfileData(
      userMap,
      contributor,
    )

    expect(updatedContributor.bio).toBe('A test bio.')
    expect(updatedContributor.prolitteris_id).toBe('PL123')
    expect(updatedContributor.prolitteris_first_name).toBe('John')
    expect(updatedContributor.prolitteris_last_name).toBe('Doe')
    expect(updatedContributor.gender).toBe('m')
  })

  test('should handle missing profile fields gracefully', async () => {
    const userMap = new Map<string, any>([
      [
        'user456',
        {
          id: 'user456',
          biography: undefined,
          prolitterisId: undefined,
          firstName: 'Jane',
          lastName: 'Smith',
          portraitUrl: undefined,
          gender: 'weiblich',
        },
      ],
    ])
    const contributor: Contributor = {
      name: 'Jane Smith',
      slug: 'jane-smith',
      user_id: 'user456',
    }

    const updatedContributor = await associateContributorWithProfileData(
      userMap,
      contributor,
    )

    expect(updatedContributor.bio).toBeUndefined()
    expect(updatedContributor.prolitteris_id).toBeUndefined()
    expect(updatedContributor.prolitteris_first_name).toBe(undefined)
    expect(updatedContributor.prolitteris_last_name).toBe(undefined)
    expect(updatedContributor.image).toBeUndefined()
    expect(updatedContributor.gender).toBe('f')
  })

  test('should clear user_id if user is not found', async () => {
    const userMap = new Map<string, UserRow>() // Empty map
    const contributor: Contributor = {
      name: 'Unknown User',
      slug: 'unknown-user',
      user_id: 'nonexistent-id',
    }

    const updatedContributor = await associateContributorWithProfileData(
      userMap,
      contributor,
    )

    expect(updatedContributor.user_id).toBeUndefined()
    expect(updatedContributor.bio).toBeUndefined()
    expect(updatedContributor.image).toBeUndefined()
  })

  test('should return contributor unchanged if user_id is undefined', async () => {
    const userMap = new Map<string, any>([
      ['user123', { id: 'user123', firstName: 'Valid', lastName: 'User' }],
    ])
    const contributor: Contributor = {
      name: 'No ID',
      slug: 'no-id',
      user_id: undefined,
    }

    const updatedContributor = await associateContributorWithProfileData(
      userMap,
      contributor,
    )

    // Should remain unchanged as it won't try to look up a user
    expect(updatedContributor).toEqual({
      name: 'No ID',
      slug: 'no-id',
      user_id: undefined,
    })
  })

  test('should set gender to "d" for other gender values', async () => {
    const userMap = new Map<string, any>([
      [
        'user123',
        {
          id: 'user123',
          firstName: 'Hello',
          lastName: 'User',
          gender: 'what is gender anyway',
        },
      ],
    ])
    const contributor: Contributor = {
      name: 'Hello User',
      slug: 'hello-user',
      user_id: 'user123',
    }
    const updatedContributor = await associateContributorWithProfileData(
      userMap,
      contributor,
    )
    expect(updatedContributor.gender).toBe('d')
  })

  test('should not set gender if user gender is undefined', async () => {
    const userMap = new Map<string, any>([
      [
        'userUndef',
        {
          id: 'userUndef',
          firstName: 'No',
          lastName: 'Gender',
          gender: undefined,
        },
      ],
    ])
    const contributor: Contributor = {
      name: 'No Gender User',
      slug: 'no-gender-user',
      user_id: 'userUndef',
    }
    const updatedContributor = await associateContributorWithProfileData(
      userMap,
      contributor,
    )
    expect(updatedContributor.gender).toBeUndefined()
  })
})

describe('getGenderFromGsheetData', () => {
  test('should return "m" for gsheet gender "m"', () => {
    const contributor: Contributor = { name: 'John Doe', slug: 'john-doe' }
    const authorGenderDataMap = new Map<string, GsheetAuthorGender>([
      ['John Doe', 'm'],
    ])
    expect(getGenderFromGsheetData(contributor, authorGenderDataMap)).toBe('m')
  })

  test('should return "f" for gsheet gender "f"', () => {
    const contributor: Contributor = { name: 'Jane Smith', slug: 'jane-smith' }
    const authorGenderDataMap = new Map<string, GsheetAuthorGender>([
      ['Jane Smith', 'f'],
    ])
    expect(getGenderFromGsheetData(contributor, authorGenderDataMap)).toBe('f')
  })

  test('should return "na" for gsheet gender "n"', () => {
    const contributor: Contributor = { name: 'Alex', slug: 'alex' }
    const authorGenderDataMap = new Map<string, GsheetAuthorGender>([
      ['Alex', 'n'],
    ])
    expect(getGenderFromGsheetData(contributor, authorGenderDataMap)).toBe('na')
  })

  test('should return "na" for gsheet gender "b"', () => {
    const contributor: Contributor = { name: 'Kollektiv', slug: 'kollektiv' }
    const authorGenderDataMap = new Map<string, GsheetAuthorGender>([
      ['Kollektiv', 'b'],
    ])
    expect(getGenderFromGsheetData(contributor, authorGenderDataMap)).toBe('na')
  })

  test('should return undefined if no gender data is found for the contributor', () => {
    const contributor: Contributor = { name: 'Unknown', slug: 'unknown' }
    const authorGenderDataMap = new Map<string, GsheetAuthorGender>() // Empty map
    expect(
      getGenderFromGsheetData(contributor, authorGenderDataMap),
    ).toBeUndefined()
  })

  test('should return "na" for unknown gender strings', () => {
    const contributor: Contributor = {
      name: 'Invalid Gender',
      slug: 'invalid-gender',
    }
    const authorGenderDataMap = new Map<string, GsheetAuthorGender>([
      ['Invalid Gender', '???' as any],
    ])

    expect(getGenderFromGsheetData(contributor, authorGenderDataMap)).toBe('na')
  })
})
