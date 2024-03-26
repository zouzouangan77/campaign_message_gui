import { Expose, Type } from 'class-transformer';
import { CreateContactDto } from 'src/contact/dto/create-contact.dto';

export class CreateGroupDto {
  id: number;
  name: string;
  comment: string;

  @Type(() => CreateContactDto)
  @Expose()
  contacts: CreateContactDto[];

  removeContacts?: { id: number }[];
  addContacts?: { id: number }[];
}
