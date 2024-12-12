import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { AzureBlobService } from 'src/services/AzureBlobService';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadedFileModel, UploadedFileModelSchema } from './document.schema';
import { InvoiceService } from 'src/services/InvoiceService';

@Module({
  imports:[
    MongooseModule.forFeature([{
    name: UploadedFileModel.name,
    schema: UploadedFileModelSchema
  }]),],
  controllers: [DocumentController],
  providers: [DocumentService,AzureBlobService,InvoiceService],
})
export class DocumentModule {}
