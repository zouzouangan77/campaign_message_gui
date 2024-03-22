export class CreateAttachmentDto {
  name: string;
  filename: string;
  type: string;
  location: string;
  createDate?: Date;
  updateDate?: Date;
}
