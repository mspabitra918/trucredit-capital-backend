import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Document, DocType } from './entities/document.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectModel(Document)
    private readonly docModel: typeof Document,
    private readonly s3Service: S3Service,
  ) {}

  async upload(
    file: Express.Multer.File,
    applicationId: string,
    docType: DocType = 'bank_statement',
    label?: string,
  ): Promise<Document> {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are accepted');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size must be under 10 MB');
    }

    try {
      const { s3Key } = await this.s3Service.uploadFile(file, applicationId);

      const doc = await this.docModel.create({
        applicationId,
        s3Key,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        docType,
        label: label || null,
      } as any);

      return doc;
    } catch (err) {
      this.logger.error('DocumentService.upload failed', err as any);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async findByApplication(applicationId: string): Promise<Document[]> {
    return this.docModel.findAll({
      where: { applicationId },
      order: [['createdAt', 'ASC']],
    });
  }

  async getPresignedUrl(docId: string): Promise<string> {
    const doc = await this.docModel.findByPk(docId);
    if (!doc) throw new NotFoundException('Document not found');

    return this.s3Service.getPresignedUrl(doc.s3Key);
  }

  async delete(docId: string): Promise<void> {
    const doc = await this.docModel.findByPk(docId);
    if (!doc) throw new NotFoundException('Document not found');

    await this.s3Service.deleteFile(doc.s3Key);
    await doc.destroy();
  }

  async deleteByApplication(applicationId: string): Promise<number> {
    const docs = await this.docModel.findAll({ where: { applicationId } });
    if (docs.length === 0) return 0;

    await Promise.all(
      docs.map(async (doc) => {
        await this.s3Service.deleteFile(doc.s3Key);
        await doc.destroy();
      }),
    );

    this.logger.log(
      `Deleted ${docs.length} documents for application ${applicationId}`,
    );
    return docs.length;
  }
}
