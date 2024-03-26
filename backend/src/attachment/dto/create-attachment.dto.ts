export class CreateAttachmentDto {
  id: number;
  name: string;
  filename: string;
  type: string;
  location: string;
  createDate?: Date;
  updateDate?: Date;
}
