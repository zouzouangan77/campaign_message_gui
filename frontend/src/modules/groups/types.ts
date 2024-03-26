export interface IGroup {
   
    name: string;
    comment?: string;
    addContacts?: Array<{id : number | undefined}>
    removeContacts?: Array<{id : number | undefined}>
  }
  export class Group implements IGroup {
    constructor(
      public id?: number,
      public name: string = '',
      public comment?: string,
      public addContacts?: Array<{id : number | undefined}>,
      public removeContacts?: Array<{id : number | undefined}>,
    ) {}
  }


  