import { CreateGroupDto } from 'src/group/dto/create-group.dto';
import { Expose, Type } from 'class-transformer';

export class CreateContactDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idInsta: string;

  @Type(() => CreateGroupDto)
  @Expose()
  groups: CreateGroupDto[];
}
