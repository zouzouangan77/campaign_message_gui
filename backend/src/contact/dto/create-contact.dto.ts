import { CreateGroupDto } from 'src/group/dto/create-group.dto';
import { Expose, Type } from 'class-transformer';

@Expose()
export class CreateContactDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idInsta: string;
}
