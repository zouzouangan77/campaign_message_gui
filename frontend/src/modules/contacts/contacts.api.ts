import type { Page } from '@/modules/shared/types'
import { Pageable } from '@/modules/shared/types'
import type { Contact, IContact } from './types'

export const findAllPage = async (pageable: Pageable<IContact>): Promise<Page<Contact>> => {
  const searchParam = new URLSearchParams()
  searchParam.append('limit', pageable.limit.toString())
  searchParam.append('page', pageable.page.toString())
  if (pageable.sortBys && pageable.sortBys.length > 0)
    pageable.sortBys.forEach((sort) => searchParam.append('sortBy', sort))
  if (pageable.search) searchParam.append('search', pageable.search)
  if (pageable.filter) {
    Object.entries(pageable.filter).forEach(([key, value]) => {
      searchParam.append('filter.' + key, value)
    })
  }

  const response = await fetch(`api/user/page?${searchParam.toString()}`)
  const page = (await response.json()) as Page<Contact>
  return page
}
