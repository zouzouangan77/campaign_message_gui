import type { Page } from '@/modules/shared/types'
import { Pageable } from '@/modules/shared/types'
import type { ICampaign, Campaign } from './types'
import { CampaignReject, CampaignSending } from './types'

export const findAllPage = async (pageable: Pageable<ICampaign>): Promise<Page<Campaign>> => {
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

  const response = await fetch(`api/campaign/page?${searchParam.toString()}`)
  const page = (await response.json()) as Page<Campaign>
  return page
}

export const findAllCampaign = async (): Promise<Array<Campaign>> => {
  const response = await fetch('/api/campaign')
  const campaign = (await response.json()) as Array<Campaign>
  return campaign
}

export const findOneCampaign = async (id: number): Promise<Campaign> => {
  const response = await fetch(`/api/campaign/${id}`)
  const campaign = (await response.json()) as Campaign
  return campaign
}

export const createNewCampaignApi = async (newCampaign: Campaign): Promise<void> => {
  try {
    const response = await fetch('/api/campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCampaign)
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la création')
    }

  }catch (error) {
    console.log('createNewCampaignApi =', error)
    throw new Error(error as string)

  }
  
}

export const updateCampaignApi = async (id: number, updateCampaign: Campaign): Promise<void> => {
  
  try {
    const response =   await fetch(`/api/campaign/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateCampaign)
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour des données')
    }
  } catch (error) {
    console.log('updateCampaignApi =', error)
    throw new Error(error as string)
  }
  

}

export const deleteCampaignApi = async (id: number): Promise<void> => {
  await fetch(`/api/campaign/${id}`, {
    method: 'DELETE'
  })
}

export const findAllSendingPage = async (
  pageable: Pageable<{ 'campaign.id': number }>
): Promise<Page<CampaignSending>> => {
  const searchParam = new URLSearchParams()
  searchParam.append('limit', pageable.limit.toString())
  searchParam.append('page', pageable.page.toString())
  if (pageable.sortBys && pageable.sortBys.length > 0)
    pageable.sortBys.forEach((sort) => searchParam.append('sortBy', sort))
  if (pageable.search) searchParam.append('search', pageable.search)
  if (pageable.filter) {
    Object.entries(pageable.filter).forEach(([key, value]) => {
      searchParam.append('filter.' + key, value.toString())
    })
  }

  const response = await fetch(`api/campaign_sending/page?${searchParam.toString()}`)
  const page = (await response.json()) as Page<Campaign>
  return page
}

export const findAllRejectPage = async (
  pageable: Pageable<{ 'campaign.id': number }>
): Promise<Page<CampaignReject>> => {
  const searchParam = new URLSearchParams()
  searchParam.append('limit', pageable.limit.toString())
  searchParam.append('page', pageable.page.toString())
  if (pageable.sortBys && pageable.sortBys.length > 0)
    pageable.sortBys.forEach((sort) => searchParam.append('sortBy', sort))
  if (pageable.search) searchParam.append('search', pageable.search)
  if (pageable.filter) {
    Object.entries(pageable.filter).forEach(([key, value]) => {
      searchParam.append('filter.' + key, value.toString())
    })
  }

  const response = await fetch(`api/campaign_reject/page?${searchParam.toString()}`)
  const page = (await response.json()) as Page<Campaign>
  return page
}
