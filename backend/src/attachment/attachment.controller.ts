import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseInterceptors,
  Body,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { Attachment } from './entities/attachment.entity';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';

@Controller('/api/attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './.uploads', // Dossier où les fichiers seront sauvegardés
        filename: (req, file, cb) => {
          const filename = file.originalname.replace(/\s/g, '');
          const timestamp = Date.now();
          cb(null, `${timestamp}-${filename}`);
        },
      }),
    }),
  )
  create(
    @Body('name') name: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log('file = ', file);
    const createAttachmentDto: CreateAttachmentDto = {
      name: name,
      filename: file.originalname,
      type: file.mimetype,
      location: file.path,
    };
    console.log('createAttachmentDto = ', createAttachmentDto);

    return this.attachmentService.create(createAttachmentDto);
  }

  @Get()
  findAll() {
    return this.attachmentService.findAll();
  }

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    const attachment = await this.attachmentService.findOne(+id);
    if (!attachment || !fs.existsSync(attachment.location)) {
      throw new NotFoundException('File not found');
    } else {
      try {
        const fileStream = fs.createReadStream(attachment.location);

        fileStream.on('open', () => {
          // Définit le type de contenu de la réponse
          res.set(
            'Content-Type',
            attachment.type ?? 'application/octet-stream',
          );
          fileStream.pipe(res);
        });

        fileStream.on('error', (error) => {
          throw new NotFoundException('File Not Found');
        });
      } catch (error) {
        throw new NotFoundException('File Not Found');
      }
    }
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './.uploads', // Dossier où les fichiers seront sauvegardés
        filename: (req, file, cb) => {
          const filename = file.originalname.replace(/\s/g, '');
          const timestamp = Date.now();
          cb(null, `${timestamp}-${filename}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000000 })],
      }),
    )
    file: Express.Multer.File | undefined,
    @Body('name') name: string | undefined,
  ) {
    const updateAttachmentDto: UpdateAttachmentDto = new UpdateAttachmentDto();
    if (name) updateAttachmentDto.name = name;
    if (file) {
      updateAttachmentDto.type = file.mimetype;
      updateAttachmentDto.location = file.path;
      updateAttachmentDto.filename = file.originalname;
    }

    return this.attachmentService.update(+id, updateAttachmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attachmentService.remove(+id);
  }

  @Get('page')
  public findAllPage(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Attachment>> {
    return this.attachmentService.findAllPage(query);
  }
}
