import type { Page } from '@/modules/shared/types'
import { Pageable } from '@/modules/shared/types'
import type { Attachment, IAttachment } from './types'

export const findAllPage = async (pageable: Pageable<IAttachment>): Promise<Page<Attachment>> => {
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

  const response = await fetch(`api/attachment/page?${searchParam.toString()}`)
  const page = (await response.json()) as Page<Attachment>
  return page
}

export const findAllAttachment = async (): Promise<Array<Attachment>> => {
  const response = await fetch('/api/attachment')
  const attachments = (await response.json()) as Array<Attachment>
  return attachments
}

export const createNewAttachmentApi = async (formData: FormData): Promise<void> => {
  try {
    const response = await fetch('/api/attachment', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la création')
    }
  } catch (error) {
    console.log('updateAttachmentApi =', error)
    throw new Error(error as string)
  }
}

export const updateAttachmentApi = async (id: number, formData: FormData): Promise<void> => {
  try {
    const response = await fetch(`/api/attachment/${id}`, {
      method: 'PATCH',
      body: formData
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour des données')
    }
  } catch (error) {
    console.log('updateAttachmentApi =', error)
    throw new Error(error as string)
  }
}

export const deleteAttachmentApi = async (id: number): Promise<void> => {
  await fetch(`/api/attachment/${id}`, {
    method: 'DELETE'
  })
}
