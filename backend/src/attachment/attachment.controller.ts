// attachment.controller.ts - Version corrigée
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UploadedFile,
  ParseFilePipe,
  ParseFilePipeBuilder,
  MaxFileSizeValidator,
  UseInterceptors,
  Body,
  Res,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Attachment } from './entities/attachment.entity';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';

@Controller('/api/attachment')
export class AttachmentController {
  private readonly logger = new Logger(AttachmentController.name);
  private readonly uploadsDir = process.env.UPLOAD_DIR || '.uploads';

  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadDir = process.env.UPLOAD_DIR || '.uploads';

            // Créer le dossier s'il n'existe pas
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            // Nettoyer le nom de fichier pour éviter les problèmes
            const cleanFilename = file.originalname
                .replace(/[^a-zA-Z0-9.-]/g, '_') // Remplacer caractères spéciaux
                .replace(/\s+/g, '_') // Remplacer espaces par underscores
                .toLowerCase();

            const timestamp = Date.now();
            const finalFilename = `${timestamp}-${cleanFilename}`;

            console.log('=== UPLOAD FICHIER ===');
            console.log('Fichier original:', file.originalname);
            console.log('Fichier nettoyé:', finalFilename);
            console.log('MIME type:', file.mimetype);
            console.log('Taille:', file.size, 'bytes');

            cb(null, finalFilename);
          },
        }),
        fileFilter: (req, file, cb) => {
          // Validation stricte des types de fichiers
          const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];

          console.log('Validation fichier:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });

          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error(`Type de fichier non supporté: ${file.mimetype}`), false);
          }
        },
        limits: {
          fileSize: 16 * 1024 * 1024, // 16MB max (limite WhatsApp)
        }
      }),
  )
  async create(
      @Body('name') name: string,
      @UploadedFile(
          new ParseFilePipe({
            validators: [new MaxFileSizeValidator({ maxSize: 16000000 })], // 16MB
          }),
      )
      file: Express.Multer.File,
  ) {
    console.log('=== POST-UPLOAD VALIDATION ===');
    console.log('File info complète:', {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      encoding: file.encoding
    });

    // Vérification immédiate de l'existence du fichier
    if (!fs.existsSync(file.path)) {
      this.logger.error(`Fichier non trouvé après upload: ${file.path}`);
      throw new Error('Erreur lors de la sauvegarde du fichier');
    }

    // Normaliser le chemin pour éviter les problèmes Windows/Unix
    const normalizedPath = file.path.replace(/\\/g, '/');

    // Validation supplémentaire pour les images
    if (file.mimetype.startsWith('image/')) {
      const validationResult = await this.validateImageFile(file.path);
      if (!validationResult.valid) {
        // Supprimer le fichier défectueux
        fs.unlinkSync(file.path);
        throw new Error(`Image invalide: ${validationResult.error}`);
      }
    }

    const createAttachmentDto: CreateAttachmentDto = {
      id: null,
      name: name || file.originalname,
      filename: file.originalname,
      type: file.mimetype,
      location: normalizedPath, // Chemin normalisé
    };

    console.log('CreateAttachmentDto final:', createAttachmentDto);

    try {
      const result = await this.attachmentService.create(createAttachmentDto);
      this.logger.log(`✅ Attachment créé avec succès: ID ${result.id}`);

      // Vérification finale de l'intégrité
      const finalCheck = await this.attachmentService.findOneWithFileValidation(result.id);
      if (!finalCheck.fileExists) {
        this.logger.error('❌ Fichier perdu après création en DB');
        throw new Error('Fichier perdu après création');
      }

      console.log('✅ Validation finale réussie:', {
        id: result.id,
        fileExists: finalCheck.fileExists,
        path: finalCheck.normalizedPath
      });

      return result;
    } catch (error) {
      this.logger.error('Erreur lors de la création de l\'attachment:', error);

      // Nettoyer le fichier en cas d'erreur
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      throw error;
    }
  }

  // Nouvelle méthode de validation des images
  private async validateImageFile(filePath: string): Promise<{valid: boolean, error?: string}> {
    try {
      const buffer = fs.readFileSync(filePath);
      const stats = fs.statSync(filePath);

      // Vérifier la taille minimale
      if (stats.size < 100) {
        return { valid: false, error: 'Fichier trop petit' };
      }

      // Vérifier les signatures de fichier (magic numbers)
      const ext = path.extname(filePath).toLowerCase();

      switch (ext) {
        case '.jpg':
        case '.jpeg':
          // JPEG commence par FFD8 et finit par FFD9
          if (buffer.length < 4 ||
              buffer[0] !== 0xFF || buffer[1] !== 0xD8 ||
              buffer[buffer.length - 2] !== 0xFF || buffer[buffer.length - 1] !== 0xD9) {
            return { valid: false, error: 'Format JPEG invalide' };
          }
          break;

        case '.png':
          // PNG commence par la signature PNG
          const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
          if (buffer.length < 8) {
            return { valid: false, error: 'Fichier PNG trop petit' };
          }

          for (let i = 0; i < 8; i++) {
            if (buffer[i] !== pngSignature[i]) {
              return { valid: false, error: 'Format PNG invalide' };
            }
          }
          break;

        case '.gif':
          // GIF commence par "GIF87a" ou "GIF89a"
          const gifHeader = buffer.slice(0, 6).toString('ascii');
          if (gifHeader !== 'GIF87a' && gifHeader !== 'GIF89a') {
            return { valid: false, error: 'Format GIF invalide' };
          }
          break;

        default:
          // Pour les autres types, accepter si la taille est correcte
          break;
      }

      console.log('✅ Image validée:', {
        path: filePath,
        size: stats.size,
        extension: ext,
        firstBytes: buffer.slice(0, 4)
      });

      return { valid: true };

    } catch (error) {
      return { valid: false, error: `Erreur validation: ${error.message}` };
    }
  }

  @Get()
  findAll() {
    return this.attachmentService.findAll();
  }

  @Get('page')
  public findAllPage(
      @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Attachment>> {
    return this.attachmentService.findAllPage(query);
  }

  @Get('debug/files')
  async debugFiles() {
    const files = await this.attachmentService.listUploadedFiles();
    return { uploadDir: this.uploadsDir, files };
  }

  // Nouvelle route pour valider un attachment spécifique
  @Get('validate/:id')
  async validateAttachment(@Param('id') id: string) {
    const result = await this.attachmentService.findOneWithFileValidation(+id);

    if (!result.attachment) {
      throw new NotFoundException('Attachment non trouvé');
    }

    let imageValidation: { valid: boolean; error?: string } = { valid: true, error: null };

    if (result.attachment.type.startsWith('image/') && result.fileExists) {
      imageValidation = await this.validateImageFile(result.normalizedPath);
    }

    return {
      attachment: result.attachment,
      fileExists: result.fileExists,
      normalizedPath: result.normalizedPath,
      imageValidation
    };
  }

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const { attachment, fileExists, normalizedPath } = await this.attachmentService.findOneWithFileValidation(+id);

      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }

      if (!fileExists) {
        this.logger.error(`Fichier physique non trouvé: ${attachment.location}`);
        this.logger.error(`Chemin normalisé: ${normalizedPath}`);
        throw new NotFoundException('File not found on disk');
      }

      const fileStream = fs.createReadStream(normalizedPath);

      fileStream.on('open', () => {
        res.set('Content-Type', attachment.type ?? 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="${attachment.filename}"`);
        res.set('Cache-Control', 'no-cache'); // Éviter les problèmes de cache
        fileStream.pipe(res);
      });

      fileStream.on('error', (error) => {
        this.logger.error(`Erreur lors de la lecture du fichier ${normalizedPath}:`, error);
        throw new NotFoundException('Error reading file');
      });

    } catch (error) {
      this.logger.error(`Erreur dans findOne pour ID ${id}:`, error);
      throw error;
    }
  }

  @Patch(':id')
  @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadDir = process.env.UPLOAD_DIR || '.uploads';

            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            const cleanFilename = file.originalname
                .replace(/[^a-zA-Z0-9.-]/g, '_')
                .replace(/\s+/g, '_')
                .toLowerCase();

            const timestamp = Date.now();
            cb(null, `${timestamp}-${cleanFilename}`);
          },
        }),
      }),
  )
  async update(
      @Param('id') id: string,
      @UploadedFile(
          new ParseFilePipeBuilder()
              .addMaxSizeValidator({
                maxSize: 16000000, // 16MB
              })
              .build({
                fileIsRequired: false,
              }),
      )
      file: Express.Multer.File,
      @Body('name') name: string,
  ) {
    const updateAttachmentDto: UpdateAttachmentDto = new UpdateAttachmentDto();

    if (name) updateAttachmentDto.name = name;

    if (file) {
      // Vérifier l'existence du nouveau fichier
      if (!fs.existsSync(file.path)) {
        this.logger.error(`Nouveau fichier non trouvé: ${file.path}`);
        throw new Error('Erreur lors de la sauvegarde du nouveau fichier');
      }

      // Validation du nouveau fichier s'il s'agit d'une image
      if (file.mimetype.startsWith('image/')) {
        const validationResult = await this.validateImageFile(file.path);
        if (!validationResult.valid) {
          fs.unlinkSync(file.path);
          throw new Error(`Nouvelle image invalide: ${validationResult.error}`);
        }
      }

      updateAttachmentDto.type = file.mimetype;
      updateAttachmentDto.location = file.path.replace(/\\/g, '/'); // Normaliser
      updateAttachmentDto.filename = file.originalname;
    }

    return this.attachmentService.update(+id, updateAttachmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attachmentService.remove(+id);
  }
}