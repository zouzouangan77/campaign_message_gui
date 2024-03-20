import { Expose } from 'class-transformer';

@Expose()
export class CreateGroupDto {
  id: number;
  name: string;
  comment: string;
}
