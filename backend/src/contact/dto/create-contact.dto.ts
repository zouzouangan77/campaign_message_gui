import { Expose } from 'class-transformer';

@Expose()
export class CreateContactDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idInsta: string;
}
