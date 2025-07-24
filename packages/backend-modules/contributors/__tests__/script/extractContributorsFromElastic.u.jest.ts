import { extractContributorsFromElasticFunctions } from '../../script/extractContributorsFromElastic'
import {
  Contributor,
  ElasticContributor,
  RawContributor,
  RepoData,
} from '../../types'

const {
  generateUniqueSlug,
  slugIsNumbered,
  containsShortSequence,
  containsSpecialCharacters,
  convertRepoDataToContributorsList,
  deduplicateNamesAndSlugs,
} = extractContributorsFromElasticFunctions

describe('test converting repo data to contributors list', () => {
  test('some contributors', () => {
    const elasticContributors1: ElasticContributor[] = [
      { name: 'Luciana Kolbeck', kind: 'Text', userId: '123-456' },
      { name: 'Photo Grapher', kind: 'Photos' },
    ]
    const elasticContributors2: ElasticContributor[] = [
      { name: 'Journi Reporter', kind: 'Text' },
      { name: 'Luciana Kolbeck', kind: 'Text', userId: '123-456' },
    ]
    const repoData: RepoData[] = [
      {
        contributors: elasticContributors1,
      },
      {
        contributors: elasticContributors2,
      },
    ]
    const expectedContributors: RawContributor[] = [
      { name: 'Luciana Kolbeck', user_id: '123-456' },
      { name: 'Photo Grapher' },
      { name: 'Journi Reporter' },
      { name: 'Luciana Kolbeck', user_id: '123-456' },
    ]
    expect(convertRepoDataToContributorsList(repoData)).toEqual(
      expectedContributors,
    )
  })

  test('no contributors', () => {
    const repoData: RepoData[] = [
      {
        contributors: [],
      },
      {
        contributors: [],
      },
    ]
    expect(convertRepoDataToContributorsList(repoData)).toEqual([])
  })
})

describe('test names and slugs to flag', () => {
  test('slug with number (from a duplicate slug)', () => {
    expect(slugIsNumbered('hello-slug-2')).toBe(true)
    expect(slugIsNumbered('another-item-123')).toBe(true)
    expect(slugIsNumbered('porter-m.-sluggy')).toBe(false)
    expect(slugIsNumbered('item-number-5a')).toBe(false)
    expect(slugIsNumbered('simple-slug')).toBe(false)
    expect(slugIsNumbered('')).toBe(false)
    expect(slugIsNumbered('123')).toBe(false)
    expect(slugIsNumbered('item-4-')).toBe(false)
  })

  test('test if the name contains a short sequence with max 3 characters', () => {
    expect(containsShortSequence('rosina-van-fanfare')).toBe(true)
    expect(containsShortSequence('hallo tschüss')).toBe(false)
    expect(containsShortSequence('illustration von efrfw erwrewr')).toBe(true)
    expect(containsShortSequence('this.is.fine')).toBe(true)
    expect(containsShortSequence('hallo (hallo) hallo.')).toBe(false)
  })

  test('test if the name contains special characters', () => {
    expect(containsSpecialCharacters('rosina-van-fanfare')).toBe(false)
    expect(containsSpecialCharacters('hallo tschüss')).toBe(false)
    expect(containsSpecialCharacters('this.is.fine')).toBe(true)
    expect(containsSpecialCharacters('hallo (hallo) hallo.')).toBe(true)
  })
})

describe('test slug generation', () => {
  // empty existing slugs
  expect(generateUniqueSlug('new-item', new Set())).toBe('new-item')

  // some existing slugs
  const existingSlugs = new Set(['existing-slug', 'another-slug'])
  expect(generateUniqueSlug('new-item', existingSlugs)).toBe('new-item')
  expect(generateUniqueSlug('existing-slug', existingSlugs)).toBe(
    'existing-slug-1',
  )

  // numbered slug already exists
  existingSlugs.add('existing-slug-1')
  expect(generateUniqueSlug('existing-slug', existingSlugs)).toBe(
    'existing-slug-2',
  )

  // weird cases that should not happen
  existingSlugs.add('existing-slug-1-2')
  expect(generateUniqueSlug('existing-slug-1', existingSlugs)).toBe(
    'existing-slug-1-1',
  )

  existingSlugs.add('-1')
  expect(generateUniqueSlug('', existingSlugs)).toBe('')

  existingSlugs.add('')
  expect(generateUniqueSlug('', existingSlugs)).toBe('-2')

  existingSlugs.add('13453654')
  expect(generateUniqueSlug('13453654', existingSlugs)).toBe('13453654-1')
})

describe('test deduplicating contributors and slugs', () => {
  test('duplicate contributors', () => {
    const rawContributors: RawContributor[] = [
      { name: 'Luciana Kolbeck', user_id: '123-456' },
      { name: 'Photo Grapher' },
      { name: 'Journi Reporter' },
      { name: 'Luciana Kolbeck' },
    ]
    const expectedContributors: Contributor[] = [
      { name: 'Luciana Kolbeck', slug: 'luciana-kolbeck', user_id: '123-456' },
      { name: 'Photo Grapher', slug: 'photo-grapher' },
      { name: 'Journi Reporter', slug: 'journi-reporter' },
    ]
    expect(deduplicateNamesAndSlugs(rawContributors)).toEqual(
      expectedContributors,
    )
  })
  test('duplicate contributors with suplicate slugs', () => {
    const rawContributors: RawContributor[] = [
      { name: 'Luciaena Kolbeck', user_id: '123-456' },
      { name: 'Photo Grapher' },
      { name: 'Journi Reporter' },
      { name: 'Luciana Kolbeck' },
      { name: 'Luciäna Kolbeck' },
      { name: 'Photo Grapher' },
      { name: 'Luciaena Kolbeck' },
    ]
    const expectedContributors: Contributor[] = [
      { name: 'Luciaena Kolbeck', slug: 'luciaena-kolbeck', user_id: '123-456' },
      { name: 'Photo Grapher', slug: 'photo-grapher' },
      { name: 'Journi Reporter', slug: 'journi-reporter' },
      { name: 'Luciana Kolbeck', slug: 'luciana-kolbeck' },
      { name: 'Luciäna Kolbeck', slug: 'luciaena-kolbeck-1' }
    ]
    expect(deduplicateNamesAndSlugs(rawContributors)).toEqual(
      expectedContributors,
    )
  })
})
