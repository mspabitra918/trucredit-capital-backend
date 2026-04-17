import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('AWS_S3_BUCKET', 'trucredit-documents');
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  /**
   * Upload a file to the private S3 bucket.
   * Returns the S3 key for storage in the database.
   */
  async uploadFile(
    file: Express.Multer.File,
    applicationId: string = 'temp',
  ): Promise<{ s3Key: string }> {
    const ext = file.originalname.split('.').pop() || 'pdf';
    const s3Key = `applications/${applicationId}/${uuid()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
      }),
    );

    this.logger.log(`Uploaded ${s3Key} (${file.size} bytes)`);
    return { s3Key };
  }

  /**
   * Generate a presigned URL that expires in 10 minutes.
   * Admin uses this to view PDFs securely.
   */
  async getPresignedUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ResponseContentType: 'application/pdf',
      ResponseContentDisposition: 'inline',
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 600 }); // 10 min
    return url;
  }

  /**
   * Delete a file from S3.
   */
  async deleteFile(s3Key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      }),
    );
    this.logger.log(`Deleted ${s3Key}`);
  }
}
