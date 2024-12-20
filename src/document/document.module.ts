import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { LocalFileService } from 'src/services/AzureBlobService';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadedFileModel, UploadedFileModelSchema } from './document.schema';
import { InvoiceService } from 'src/services/InvoiceService';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BankingService } from 'src/services/BankingService';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // Serve files under /uploads route
    }),
    MongooseModule.forFeature([{
    name: UploadedFileModel.name,
    schema: UploadedFileModelSchema
  }]), HttpModule],
  controllers: [DocumentController],
  providers: [DocumentService,LocalFileService,InvoiceService,BankingService],
})
export class DocumentModule {}
