import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CsvService } from 'src/csv/csv.service';
import { Repository } from 'typeorm';
import {
  FilterOperator,
  FilterSuffix,
  PaginateQuery,
  Paginated,
  paginate,
} from 'nestjs-paginate';
// import {
//   FilterOperator,
//   FilterSuffix,
//   Paginate,
//   PaginateQuery,
//   paginate,
//   Paginated,
// } from 'nestjs-paginate';

@Injectable()
export class UserService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: Repository<User>,

    private readonly csvService: CsvService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.save(createUserDto);
  }

  // async findAll(query: PaginateQuery): Promise<Paginated<User>> {
  //   return paginate(query, this.userRepository, {
  //     sortableColumns: ['id', 'name', 'color', 'age'],
  //     nullSort: 'last',
  //     defaultSortBy: [['id', 'DESC']],
  //     searchableColumns: ['name', 'color', 'age'],
  //     select: ['id', 'name', 'color', 'age', 'lastVetVisit'],
  //     filterableColumns: {
  //       name: [FilterOperator.EQ, FilterSuffix.NOT],
  //       age: true,
  //     },
  //   });
  // }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findAllPage(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.userRepository, {
      sortableColumns: ['id', 'firstName', 'lastName', 'phoneNumber', 'idInsta'],
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

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update({ id: id }, updateUserDto);
  }

  async remove(id: number): Promise<User> {
    return this.userRepository.remove({ id: id } as User);
  }

  async bulkCsvCreateUsers(csvString: string) {
    const createUserDtos = new Array<CreateUserDto>();
    await this.csvService.readStringCsv(csvString, ';', async (userData) => {
      const createUserDto = new CreateUserDto();
      createUserDto.firstName = userData['firstname'];
      createUserDto.lastName = userData['lastname'];
      createUserDto.phoneNumber = userData['phone'];
      createUserDto.idInsta = userData['idInsta'];
      // const checkUser = false
      const checkUser = await this.userRepository.findOne({
        where: [
          { phoneNumber: createUserDto.phoneNumber },
          { idInsta: createUserDto.idInsta ? createUserDto.idInsta : '' },
        ],
      });
      if (!checkUser) createUserDtos.push(createUserDto);
    });
    await this.sleep(2000);
    try {
      return await this.userRepository.save(createUserDtos);
    } catch (error) {
      return error.errors;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
