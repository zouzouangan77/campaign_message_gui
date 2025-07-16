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
    const errors = new Array<string>();
    const stats = {
      totalProcessed: 0,
      validContacts: 0,
      duplicatesSkipped: 0,
      invalidContacts: 0,
      errorsCount: 0,
      contactsCreated: 0
    };

    try {
      // Validation initiale
      if (!csvString || csvString.trim().length === 0) {
        throw new Error('Le fichier CSV est vide ou invalide');
      }

      console.log('📄 Début du traitement du fichier CSV...');

      await this.csvService.readStringCsv(csvString, ';', async (contactData, lineNumber) => {
        stats.totalProcessed++;

        try {
          // Nettoyer et valider les données
          const cleanedData = this.cleanContactData(contactData);

          // Validation des données obligatoires
/*          if (!this.isValidContact(cleanedData)) {
            stats.invalidContacts++;
            errors.push(`Ligne ${lineNumber}: Contact invalide - phoneNumber et idInsta sont tous les deux vides`);
            return;
          }*/

          const createContactDto = new CreateContactDto();
          createContactDto.firstName = cleanedData.firstName;
          createContactDto.lastName = cleanedData.lastName;
          createContactDto.phoneNumber = cleanedData.phoneNumber;
          createContactDto.idInsta = cleanedData.idInsta;

          // Vérifier les doublons avec une requête plus robuste
          const isDuplicate = await this.checkForDuplicate(createContactDto);

          if (isDuplicate) {
            stats.duplicatesSkipped++;
            console.log(`⚠️  Doublon détecté (ligne ${lineNumber}): ${createContactDto.phoneNumber || createContactDto.idInsta}`);
            return;
          }

          createContactDtos.push(createContactDto);
          stats.validContacts++;

        } catch (error) {
          stats.errorsCount++;
          const errorMessage = `Ligne ${lineNumber}: Erreur lors du traitement - ${error.message}`;
          errors.push(errorMessage);
          console.error('❌', errorMessage);
        }
      });

      console.log('📊 Statistiques de traitement:', stats);

      // Validation avant sauvegarde
      if (createContactDtos.length === 0) {
        const message = 'Aucun contact valide à créer';
        console.warn('⚠️ ', message);
        return {
          success: false,
          message,
          stats,
          errors,
          contactsCreated: []
        };
      }

      // Délai pour éviter la surcharge
      await this.sleep(1000);

      // Sauvegarde par lots pour éviter les timeouts
      const batchSize = 100;
      const savedContacts = [];

      for (let i = 0; i < createContactDtos.length; i += batchSize) {
        const batch = createContactDtos.slice(i, i + batchSize);

        try {
          console.log(`💾 Sauvegarde du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(createContactDtos.length / batchSize)} (${batch.length} contacts)`);

          const batchResult = await this.contactRepository.save(batch);
          savedContacts.push(...batchResult);
          stats.contactsCreated += batchResult.length;

          // Petit délai entre les lots
          if (i + batchSize < createContactDtos.length) {
            await this.sleep(500);
          }

        } catch (batchError) {
          const errorMessage = `Erreur lors de la sauvegarde du lot ${Math.floor(i / batchSize) + 1}: ${batchError.message}`;
          errors.push(errorMessage);
          console.error('❌', errorMessage);

          // Essayer de sauvegarder les contacts un par un pour identifier le problématique
          for (const contact of batch) {
            try {
              const singleResult = await this.contactRepository.save([contact]);
              savedContacts.push(...singleResult);
              stats.contactsCreated++;
            } catch (singleError) {
              const singleErrorMessage = `Erreur contact individuel (${contact.phoneNumber || contact.idInsta}): ${singleError.message}`;
              errors.push(singleErrorMessage);
              console.error('❌', singleErrorMessage);
            }
          }
        }
      }

      // Résultat final
      const finalResult = {
        success: stats.contactsCreated > 0,
        message: `Traitement terminé: ${stats.contactsCreated} contacts créés sur ${stats.totalProcessed} traités`,
        stats,
        errors,
        contactsCreated: savedContacts
      };

      console.log('✅ Résultat final:', finalResult.message);

      if (errors.length > 0) {
        console.warn(`⚠️  ${errors.length} erreurs détectées:`, errors);
      }

      return finalResult;

    } catch (error) {
      const errorMessage = `Erreur critique lors du traitement CSV: ${error.message}`;
      console.error('💥', errorMessage);

      return {
        success: false,
        message: errorMessage,
        stats,
        errors: [...errors, errorMessage],
        contactsCreated: []
      };
    }
  }

  /**
   * Nettoie et standardise les données de contact
   */
  private cleanContactData(contactData: any): any {
    return {
      firstName: this.cleanString(contactData['firstname']),
      lastName: this.cleanString(contactData['lastname']),
      phoneNumber: this.cleanPhoneNumber(contactData['phone']),
      idInsta: this.cleanString(contactData['idInsta'])
    };
  }

  /**
   * Nettoie une chaîne de caractères
   */
  private cleanString(value: any): string | undefined {
    if (!value || typeof value !== 'string') return undefined;

    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : undefined;
  }

  /**
   * Nettoie et valide un numéro de téléphone
   */
  private cleanPhoneNumber(value: any): string | undefined {
    if (!value || typeof value !== 'string') return undefined;

    const cleaned = value.trim().replace(/\s+/g, '');

    // Validation basique du numéro de téléphone
    if (cleaned.length < 6 || !/^\d+$/.test(cleaned)) {
      return undefined;
    }

    return cleaned;
  }

  /**
   * Valide qu'un contact a au moins un moyen de contact
   */
  private isValidContact(contactData: any): boolean {
    const hasPhone = contactData.phoneNumber && contactData.phoneNumber.length > 0;
    const hasInsta = contactData.idInsta && contactData.idInsta.length > 0;

    return hasPhone || hasInsta;
  }

  /**
   * Vérifie les doublons de manière plus robuste
   */
  private async checkForDuplicate(createContactDto: CreateContactDto): Promise<boolean> {
    try {
      const whereConditions = [];

      // Ajouter les conditions seulement si les valeurs existent
      if (createContactDto.phoneNumber) {
        whereConditions.push({ phoneNumber: createContactDto.phoneNumber });
      }

      if (createContactDto.idInsta) {
        whereConditions.push({ idInsta: createContactDto.idInsta });
      }

      // Si aucune condition, pas de doublon possible
      if (whereConditions.length === 0) {
        return false;
      }

      const existingContact = await this.contactRepository.findOne({
        where: whereConditions
      });

      return !!existingContact;

    } catch (error) {
      console.error('Erreur lors de la vérification des doublons:', error.message);
      // En cas d'erreur, on considère qu'il n'y a pas de doublon pour ne pas bloquer l'insertion
      return false;
    }
  }

  /**
   * Fonction sleep améliorée
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
