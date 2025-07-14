import { Inject, Injectable, Logger } from '@nestjs/common';
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
import * as path from 'path';
import { Attachment } from './entities/attachment.entity';

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);
  private readonly uploadsDir = process.env.UPLOAD_DIR || '.uploads';

  constructor(
      @Inject('ATTACHMENTS_REPOSITORY')
      private readonly attachmentRepository: Repository<Attachment>,
  ) {
    this.ensureUploadsDirExists();
  }

  /**
   * Assure que le dossier uploads existe
   */
  private async ensureUploadsDirExists(): Promise<void> {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
        this.logger.log(`Dossier uploads créé: ${this.uploadsDir}`);
      }
    } catch (error) {
      this.logger.error('Erreur lors de la création du dossier uploads:', error);
    }
  }

  /**
   * Normalise le chemin du fichier pour éviter les problèmes de chemin relatif/absolu
   */
  private normalizePath(filePath: string): string {
    if (!filePath) return '';

    // Normaliser les slashes (Windows -> Unix)
    let normalizedPath = filePath.replace(/\\/g, '/');

    // Si le chemin est déjà absolu, le retourner tel quel
    if (path.isAbsolute(normalizedPath)) {
      return normalizedPath;
    }

    // Sinon, construire le chemin absolu
    const absolutePath = path.resolve(process.cwd(), normalizedPath);

    // Re-normaliser après résolution (au cas où)
    return absolutePath.replace(/\\/g, '/');
  }

  /**
   * Vérifie si un fichier existe
   */
  private fileExists(filePath: string): boolean {
    if (!filePath) return false;

    const normalizedPath = this.normalizePath(filePath);
    const exists = fs.existsSync(normalizedPath);

    if (!exists) {
      this.logger.debug(`Fichier non trouvé: ${normalizedPath}`);
    }

    return exists;
  }

  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    console.log('=== SERVICE CREATE ATTACHMENT ===');
    console.log('DTO reçu:', createAttachmentDto);

    // Vérifier que le fichier existe avant de sauvegarder en DB
    if (createAttachmentDto.location && !this.fileExists(createAttachmentDto.location)) {
      this.logger.error(`Fichier non trouvé lors de la création: ${createAttachmentDto.location}`);
      throw new Error(`Fichier non trouvé: ${createAttachmentDto.location}`);
    }

    // Normaliser le chemin avant sauvegarde
    if (createAttachmentDto.location) {
      const originalPath = createAttachmentDto.location;
      createAttachmentDto.location = this.normalizePath(createAttachmentDto.location);

      console.log('Normalisation du chemin:', {
        original: originalPath,
        normalized: createAttachmentDto.location
      });
    }

    const attachment = await this.attachmentRepository.save(createAttachmentDto);
    this.logger.log(`✅ Attachment créé avec succès: ID ${attachment.id}, fichier: ${attachment.location}`);

    return attachment;
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
    const attachment = await this.attachmentRepository.findOne({
      where: { id: id },
    });

    if (attachment) {
      // Vérifier si le fichier existe physiquement
      const fileExists = this.fileExists(attachment.location);
      if (!fileExists) {
        this.logger.warn(`⚠️  Fichier manquant pour l'attachment ${id}: ${attachment.location}`);
      } else {
        this.logger.debug(`✅ Fichier trouvé pour l'attachment ${id}: ${attachment.location}`);
      }
    }

    return attachment;
  }

  /**
   * Récupère un attachment avec validation de l'existence du fichier
   */
  async findOneWithFileValidation(id: number): Promise<{
    attachment: Attachment;
    fileExists: boolean;
    normalizedPath: string;
    fileStats?: any;
  }> {
    const attachment = await this.findOne(id);

    if (!attachment) {
      return { attachment: null, fileExists: false, normalizedPath: null };
    }

    const normalizedPath = this.normalizePath(attachment.location);
    const fileExists = this.fileExists(attachment.location);

    let fileStats = null;
    if (fileExists) {
      try {
        const stats = fs.statSync(normalizedPath);
        fileStats = {
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime,
          sizeKB: Math.round(stats.size / 1024),
          sizeMB: Math.round(stats.size / (1024 * 1024) * 100) / 100
        };
      } catch (error) {
        this.logger.warn(`Erreur lors de la récupération des stats du fichier: ${error.message}`);
      }
    }

    console.log('=== FILE VALIDATION RESULT ===', {
      attachmentId: id,
      originalPath: attachment.location,
      normalizedPath,
      fileExists,
      fileStats
    });

    return { attachment, fileExists, normalizedPath, fileStats };
  }

  async update(id: number, updateAttachmentDto: UpdateAttachmentDto) {
    this.logger.log(`Mise à jour attachment ${id}:`, updateAttachmentDto);

    // Si un nouveau fichier est fourni, vérifier son existence
    if (updateAttachmentDto.location && !this.fileExists(updateAttachmentDto.location)) {
      this.logger.error(`Nouveau fichier non trouvé: ${updateAttachmentDto.location}`);
      throw new Error(`Fichier non trouvé: ${updateAttachmentDto.location}`);
    }

    // Normaliser le nouveau chemin si fourni
    if (updateAttachmentDto.location) {
      updateAttachmentDto.location = this.normalizePath(updateAttachmentDto.location);
    }

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
      const normalizedPath = this.normalizePath(attachment.location);

      if (fs.existsSync(normalizedPath)) {
        try {
          fs.unlinkSync(normalizedPath);
          this.logger.log(`Fichier supprimé: ${normalizedPath}`);
        } catch (error) {
          this.logger.error(`Erreur lors de la suppression du fichier ${normalizedPath}:`, error);
        }
      } else {
        this.logger.warn(`Fichier déjà supprimé ou non trouvé: ${normalizedPath}`);
      }

      return this.attachmentRepository.remove(attachment);
    }
  }

  /**
   * Méthode utilitaire pour debug - liste tous les fichiers dans le dossier uploads
   */
  async listUploadedFiles(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        return [];
      }

      const files = fs.readdirSync(this.uploadsDir);
      this.logger.debug(`Fichiers dans ${this.uploadsDir}:`, files);
      return files;
    } catch (error) {
      this.logger.error('Erreur lors de la lecture du dossier uploads:', error);
      return [];
    }
  }

  /**
   * Valide l'intégrité d'un fichier image
   */
  async validateImageIntegrity(attachmentId: number): Promise<{valid: boolean, error?: string, details?: any}> {
    try {
      const { attachment, fileExists, normalizedPath } = await this.findOneWithFileValidation(attachmentId);

      if (!attachment) {
        return { valid: false, error: 'Attachment non trouvé' };
      }

      if (!fileExists) {
        return { valid: false, error: 'Fichier physique non trouvé' };
      }

      // Pour les images, vérifier qu'elles ne sont pas corrompues
      if (attachment.type.startsWith('image/')) {
        const buffer = fs.readFileSync(normalizedPath);
        const stats = fs.statSync(normalizedPath);

        const details = {
          size: stats.size,
          firstBytes: buffer.slice(0, 8),
          lastBytes: buffer.slice(-4),
          extension: path.extname(normalizedPath).toLowerCase()
        };

        // Vérifications basiques pour JPEG
        if (attachment.type === 'image/jpeg') {
          if (buffer.length < 4 ||
              buffer[0] !== 0xFF || buffer[1] !== 0xD8 ||
              buffer[buffer.length - 2] !== 0xFF || buffer[buffer.length - 1] !== 0xD9) {
            return { valid: false, error: 'Image JPEG corrompue', details };
          }
        }

        // Vérifications basiques pour PNG
        if (attachment.type === 'image/png') {
          const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
          if (buffer.length < 8) {
            return { valid: false, error: 'Image PNG trop petite', details };
          }

          for (let i = 0; i < 8; i++) {
            if (buffer[i] !== pngSignature[i]) {
              return { valid: false, error: 'Image PNG corrompue', details };
            }
          }
        }

        return { valid: true, details };
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, error: `Erreur validation: ${error.message}` };
    }
  }
}