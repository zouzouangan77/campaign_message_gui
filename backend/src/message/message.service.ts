import { Inject, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import {
  FilterOperator,
  FilterSuffix,
  PaginateQuery,
  Paginated,
  paginate,
} from 'nestjs-paginate';

@Injectable()
export class MessageService {
  constructor(
    @Inject('MESSAGES_REPOSITORY')
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageRepository.save(createMessageDto);
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }

  async findAllPage(query: PaginateQuery): Promise<Paginated<Message>> {
    return paginate(query, this.messageRepository, {
      sortableColumns: ['id', 'name', 'createDate', 'updateDate'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name', 'content'],
      select: ['id', 'name', 'content', 'createDate', 'updateDate'],
      filterableColumns: {
        name: [FilterOperator.ILIKE, FilterSuffix.NOT],
        content: [FilterOperator.ILIKE, FilterSuffix.NOT],
      },
    });
  }

  async findOne(id: number): Promise<Message> {
    return this.messageRepository.findOne({ where: { id: id } });
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    return this.messageRepository.update({ id: id }, updateMessageDto);
  }

  async remove(id: number): Promise<Message> {
    return this.messageRepository.remove({ id: id } as Message);
  }
}
