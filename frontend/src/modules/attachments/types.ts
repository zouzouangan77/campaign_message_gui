export interface IAttachment {
  name: string;
  filename?: string;
  type?: string;
  location?: string;
  createDate?: string;
  updateDate?: string;
}
export class Attachment implements IAttachment {
  constructor(
    public id?: number,
    public name: string='',
    public filename?: string,
    public type?: string,
    public location?: string,
    public createDate?: string,
    public updateDate?: string
  ) {}
}
