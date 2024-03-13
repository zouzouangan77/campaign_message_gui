export interface IContact {
  firstName: string
  lastName?: string
  phoneNumber?: string
  idInsta?: string
}
export class Contact implements IContact {
  constructor(
    public id?: number,
    public firstName: string = '',
    public lastName?: string,
    public phoneNumber?: string,
    public idInsta?: string
  ) {}
}
