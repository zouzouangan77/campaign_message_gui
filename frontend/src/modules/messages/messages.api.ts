import type { Page } from '@/modules/shared/types'
import { Pageable } from '@/modules/shared/types'
import type { Message, IMessage } from './types'

export const findAllPage = async (pageable: Pageable<IMessage>): Promise<Page<Message>> => {
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
  
    const response = await fetch(`api/message/page?${searchParam.toString()}`)
    const page = (await response.json()) as Page<Message>
    return page
  }

export const findAll = async (): Promise<Array<Message>> => {
    const response = await fetch('/api/message')
    const message = (await response.json()) as Array<Message>
    return message
  }
  
export const createNewMessageApi = async (newMessage: Message): Promise<void> => {
    await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMessage)
    })
  }
  
export const updateMessageApi = async (id: number, updateMessage: Message): Promise<void> => {
    await fetch(`/api/message/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateMessage)
    })
  }
  
export const deleteMessageApi = async (id: number): Promise<void> => {
    await fetch(`/api/message/${id}`, {
      method: 'DELETE'
    })
  }
  