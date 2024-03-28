import type { Page } from '@/modules/shared/types'
import { Pageable } from '@/modules/shared/types'
import type { Group, IGroup } from './types'

export const findAllGroup = async (): Promise<Array<Group>> => {
  const response = await fetch('/api/group')
  const groups = (await response.json()) as Array<Group>
  return groups
}

export const createNewGroupApi = async (newGroup: Group): Promise<void> => {
  await fetch('/api/group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newGroup)
  })
}

export const updateGroupApi = async (id: number, updateGroup: Group): Promise<void> => {
  await fetch(`/api/group/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateGroup)
  })
}

export const deleteGroupApi = async (id: number): Promise<void> => {
  await fetch(`/api/group/${id}`, {
    method: 'DELETE'
  })
}
