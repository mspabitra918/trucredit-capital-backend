import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DocType } from './entities/document.entity';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Upload a single PDF document for a loan application.
   * Used during Step 3 of the multi-step form (Document Vault).
   */
  @Post('upload/:applicationId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOne(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('docType') docType?: DocType,
    @Query('label') label?: string,
  ) {
    const doc = await this.documentService.upload(
      file,
      applicationId,
      docType || 'bank_statement',
      label,
    );
    return { message: 'Document uploaded successfully', data: doc };
  }

  /**
   * Upload multiple PDF documents at once (bank statements, 3-6 months).
   */
  @Post('upload-multiple/:applicationId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('docType') docType?: DocType,
  ) {
    const docs = await Promise.all(
      files.map((file, i) =>
        this.documentService.upload(
          file,
          applicationId,
          docType || 'bank_statement',
          `Document ${i + 1}`,
        ),
      ),
    );
    return { message: `${docs.length} documents uploaded`, data: docs };
  }

  /**
   * List all documents for an application.
   */
  @Get('application/:applicationId')
  async listByApplication(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ) {
    const docs = await this.documentService.findByApplication(applicationId);
    return { message: 'Documents list', data: docs };
  }

  /**
   * Get a 10-minute presigned URL for viewing a PDF (admin use).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id/view')
  async getViewUrl(@Param('id', ParseUUIDPipe) id: string) {
    const url = await this.documentService.getPresignedUrl(id);
    return { message: 'Presigned URL generated (expires in 10 min)', data: { url } };
  }

  /**
   * Delete a document (admin only).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.documentService.delete(id);
    return { message: 'Document deleted' };
  }

  /**
   * Remove all documents for an application.
   * Used to clean up uploaded PDFs when the loan submission is not completed.
   */
  @Delete('application/:applicationId')
  async removeByApplication(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ) {
    const count =
      await this.documentService.deleteByApplication(applicationId);
    return { message: `${count} document(s) removed`, data: { count } };
  }
}
