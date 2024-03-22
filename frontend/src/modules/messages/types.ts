export interface IMessage {
    name: string
    content?: string
    createDate?: string
    updateDate?: string
  }
  export class Message implements IMessage {
    constructor(
      public id?: number,
      public name: string = '',
      public content?: string,
      public createDate?: Date,
      public updateDate?: Date
    ) {}
  }
  