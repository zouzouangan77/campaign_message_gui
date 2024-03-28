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

  const response = await fetch(`api/contact/page?${searchParam.toString()}`)
  const page = (await response.json()) as Page<Contact>
  return page
}

export const findAll = async (): Promise<Array<Contact>> => {
  const response = await fetch('/api/contact')
  const contacts = (await response.json()) as Array<Contact>
  return contacts
}

export const findAllContactsByGroup = async (id: number): Promise<Array<Contact>> => {
  const response = await fetch(`/api/contact/group/${id}`)
  const contacts = (await response.json()) as Array<Contact>
  return contacts
}

export const createNewContactApi = async (newContact: Contact): Promise<void> => {
  await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newContact)
  })
}

export const updateContactApi = async (id: number, updateContact: Contact): Promise<void> => {
  await fetch(`/api/contact/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateContact)
  })
}

export const deleteContactApi = async (id: number): Promise<void> => {
  await fetch(`/api/contact/${id}`, {
    method: 'DELETE'
  })
}

export const importFileContactApi = async (formData: FormData): Promise<void> => {
  const response = await fetch('/api/contact/upload/csv', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error("Erreur lors de l'import du fichier csv")
  }
}
