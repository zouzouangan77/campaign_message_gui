export interface ICampaign {
    name: string;
    createDate?: string;
    updateDate?: string;
    statut?: string;
    canal?: string;
    message?: {id: number};
    attachments?: Array<{id: number}>;
    groups?: Array<{id: number}>;
}
export class Campaign implements ICampaign {
    constructor(
      public id?: number,
      public name: string = '',
      public createDate?: string,
      public updateDate?: string,
      public statut?: string,
      public canal?: string,
      public message?:  {id: number},
      public attachments?: Array<{id: number}>,
      public groups?: Array<{id: number}>

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

export interface CampaignReject {
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
