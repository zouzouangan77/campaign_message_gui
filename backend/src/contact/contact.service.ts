import { Inject, Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { CsvService } from 'src/shared/csv.service';
import { Repository } from 'typeorm';
import {
  FilterOperator,
  FilterSuffix,
  PaginateQuery,
  Paginated,
  paginate,
} from 'nestjs-paginate';

@Injectable()
export class ContactService {
  constructor(
    @Inject('CONTACTS_REPOSITORY')
    private readonly contactRepository: Repository<Contact>,

    private readonly csvService: CsvService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactRepository.save(createContactDto);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.find();
  }

  async findAllPage(query: PaginateQuery): Promise<Paginated<Contact>> {
    return paginate(query, this.contactRepository, {
      sortableColumns: [
        'id',
        'firstName',
        'lastName',
        'phoneNumber',
        'idInsta',
      ],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['firstName', 'lastName', 'phoneNumber', 'idInsta'],
      select: ['id', 'firstName', 'lastName', 'phoneNumber', 'idInsta'],
      filterableColumns: {
        firstName: [FilterOperator.ILIKE, FilterSuffix.NOT],
        lastName: [FilterOperator.ILIKE, FilterSuffix.NOT],
        phoneNumber: [FilterOperator.ILIKE, FilterSuffix.NOT],
        idInsta: [FilterOperator.ILIKE, FilterSuffix.NOT],
      },
    });
  }

  async findOne(id: number): Promise<Contact> {
    return this.contactRepository.findOne({
      where: { id: id },
    });
  }

  async findAllByGroup(id: number): Promise<Contact[]> {
    return this.contactRepository
      .createQueryBuilder('contact')
      .innerJoin('contact.groups', 'group')
      .where('group.id = :groupId', { groupId: id })
      .getMany();
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    console.log('updateContactDto = ', updateContactDto);
    return this.contactRepository.save({ ...updateContactDto, id: id });
  }

  async remove(id: number): Promise<Contact> {
    return this.contactRepository.remove({ id: id } as Contact);
  }

  async bulkCsvCreateContacts(csvString: string) {
    const createContactDtos = new Array<CreateContactDto>();
    await this.csvService.readStringCsv(csvString, ';', async (contactData) => {
      const createContactDto = new CreateContactDto();
      createContactDto.firstName =
        contactData['firstname'] && contactData['firstname'].trim();
      createContactDto.lastName =
        contactData['lastname'] && contactData['lastname'].trim();
      createContactDto.phoneNumber =
        contactData['phone'] && contactData['phone'].trim();
      createContactDto.idInsta =
        contactData['idInsta'] && contactData['idInsta'].trim();
      if (
        createContactDto.phoneNumber !== undefined ||
        createContactDto.idInsta !== undefined
      ) {
        // const checkContact = false
        const checkContact = await this.contactRepository.findOne({
          where: [
            { phoneNumber: createContactDto.phoneNumber },
            {
              idInsta: createContactDto.idInsta ? createContactDto.idInsta : '',
            },
          ],
        });
        if (!checkContact) createContactDtos.push(createContactDto);
      }
    });
    await this.sleep(2000);
    try {
      return await this.contactRepository.save(createContactDtos);
    } catch (error) {
      return error.errors;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
