import { ASSET_CATEGORIES, isAssetCategory, slugify, categoryToFolder } from '@/src/features/assets/categories'

describe('asset categories', () => {
  test('isAssetCategory validates correctly', () => {
    for (const c of ASSET_CATEGORIES) {
      expect(isAssetCategory(c)).toBe(true)
    }
    expect(isAssetCategory('invalid')).toBe(false)
  })

  test('slugify produces url-safe slugs', () => {
    expect(slugify(' Hello World ')).toBe('hello-world')
    expect(slugify('A  B   C')).toBe('a-b-c')
    expect(slugify('Café Déjà Vu!')).toBe('caf-d-j-vu')
    expect(slugify('name__with__symbols***')).toBe('namewithsymbols')
  })

  test('categoryToFolder mapping exists for all categories', () => {
    for (const c of ASSET_CATEGORIES) {
      expect(categoryToFolder[c]).toBeDefined()
      expect(typeof categoryToFolder[c]).toBe('string')
    }
  })
})
