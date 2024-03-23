export interface IGroup {
   
    name: string;
    comment?: string;
  }
  export class Group implements IGroup {
    constructor(
      public id?: number,
      public name: string = '',
      public comment?: string,
    ) {}
  }
  