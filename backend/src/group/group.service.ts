import { Inject, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { Repository } from 'typeorm';
import {
  FilterOperator,
  FilterSuffix,
  PaginateQuery,
  Paginated,
  paginate,
} from 'nestjs-paginate';

@Injectable()
export class GroupService {
  constructor(
    @Inject('GROUPS_REPOSITORY')
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupRepository.save(createGroupDto);
  }

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find();
  }

  async findAllPage(query: PaginateQuery): Promise<Paginated<Group>> {
    return paginate(query, this.groupRepository, {
      sortableColumns: ['id', 'name'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name'],
      select: ['id', 'name', 'comment'],
      filterableColumns: {
        name: [FilterOperator.ILIKE, FilterSuffix.NOT],
        comment: [FilterOperator.ILIKE, FilterSuffix.NOT],
      },
    });
  }

  async findOne(id: number): Promise<Group> {
    return this.groupRepository.findOne({
      where: { id: id },
      relations: ['contacts'],
    });
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const {
      contacts,
      removeContacts,
      addContacts,
      ...updateContactDtoWithoutContact
    } = updateGroupDto;

    const update1 = await this.groupRepository.update(
      { id: id },
      updateContactDtoWithoutContact,
    );
    await this.groupRepository
      .createQueryBuilder()
      .relation(Group, 'contacts')
      .of(id)
      .addAndRemove(addContacts ?? [], removeContacts ?? []);

    return update1;
  }

  async remove(id: number): Promise<Group> {
    return this.groupRepository.remove({ id: id } as Group);
  }
}
