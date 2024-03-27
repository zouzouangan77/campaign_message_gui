import { Message } from '@/modules/messages/types';
import { Group } from '@/modules/groups/types';
import { Attachment } from '@/modules/attachments/types';


export interface ICampaign {
    name: string;
    createDate?: string;
    updateDate?: string;
    statut?: string;
    canal?: string;
    message?: {id: number}  | Message;
    attachments?: Array<{id: number} | Attachment>;
    groups?: Array<{id: number} | Group>;
}
export class Campaign implements ICampaign {
    constructor(
      public id?: number,
      public name: string = '',
      public createDate?: string,
      public updateDate?: string,
      public statut?: string,
      public canal?: string,
      public message?:  {id: number} | Message,
      public attachments?: Array<{id: number} | Attachment>,
      public groups?: Array<{id: number} | Group>

    ) {}
  }
  


export interface ICampaignSending {
    sendingDate?: string;
    contact?:  {id: number};
    campaign?:  {id: number};
}

export class CampaignSending implements ICampaignSending {
    constructor(
      public id?: number,
      public sendingDate?: string,
      public contact?:  {id: number},
      public campaign?:  {id: number}
    ) {}
}

export interface ICampaignReject {
    rejectDate?: string;
    contact?:  {id: number};
    campaign?:  {id: number};
    cause?: string;
}

export class CampaignReject implements ICampaignReject {
    constructor(
      public id?: number,
      public rejectDate?: string,
      public contact?:  {id: number},
      public campaign?:  {id: number},
      public  cause?: string
    ) {}
}
