import type { Page } from '@/modules/shared/types'
import { Pageable } from '@/modules/shared/types'
import type { Group, IGroup } from './types'

export const findAllGroup = async (): Promise<Array<Group>> => {
  const response = await fetch('/api/group')
  const groups = (await response.json()) as Array<Group>
  return groups
}

export const createNewGroupApi = async (newGroup: Group): Promise<void> => {
  try {
    const response =  await fetch('/api/group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newGroup)
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la création')
    }

  }catch (error) {
    console.log('createNewGroupApi =', error)
    throw new Error(error as string)

  }
  
 
}

export const updateGroupApi = async (id: number, updateGroup: Group): Promise<void> => {
  try {
    const response =   await fetch(`/api/group/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateGroup)
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour des données')
    }
  } catch (error) {
    console.log('updateGroupApi =', error)
    throw new Error(error as string)
  }
  
  
  
}

export const deleteGroupApi = async (id: number): Promise<void> => {
  await fetch(`/api/group/${id}`, {
    method: 'DELETE'
  })
}
