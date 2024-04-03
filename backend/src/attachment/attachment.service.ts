import { Inject, Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { Repository } from 'typeorm';
import {
  FilterOperator,
  FilterSuffix,
  PaginateQuery,
  Paginated,
  paginate,
} from 'nestjs-paginate';
import * as fs from 'fs';
import { Attachment } from './entities/attachment.entity';

@Injectable()
export class AttachmentService {
  constructor(
    @Inject('ATTACHMENTS_REPOSITORY')
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    return this.attachmentRepository.save(createAttachmentDto);
  }

  async findAll(): Promise<Attachment[]> {
    return this.attachmentRepository.find();
  }

  async findAllPage(query: PaginateQuery): Promise<Paginated<Attachment>> {
    return paginate(query, this.attachmentRepository, {
      sortableColumns: ['id', 'name', 'filename', 'createDate', 'updateDate'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name', 'type', 'filename'],
      select: ['id', 'name', 'filename', 'type', 'createDate', 'updateDate'],
      filterableColumns: {
        name: [FilterOperator.ILIKE, FilterSuffix.NOT],
        type: [FilterOperator.ILIKE, FilterSuffix.NOT],
        filename: [FilterOperator.ILIKE, FilterSuffix.NOT],
      },
    });
  }

  async findOne(id: number): Promise<Attachment> {
    return this.attachmentRepository.findOne({
      where: { id: id },
    });
  }

  async update(id: number, updateAttachmentDto: UpdateAttachmentDto) {
    console.log('updateAttachmentDto = ', updateAttachmentDto);
    return this.attachmentRepository.update(
      { id: id },
      {
        ...updateAttachmentDto,
        updateDate: new Date(),
      },
    );
  }
  async remove(id: number): Promise<any> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: id },
    });
    if (attachment) {
      if (fs.existsSync(attachment.location)) {
        fs.rm(attachment.location, (err) => {
          if (err) {
            console.log('Error during delete file');
            throw err;
          }
          console.log('File deleted');
        });
      }
      return this.attachmentRepository.remove({ id: id } as Attachment);
    }
  }
}
