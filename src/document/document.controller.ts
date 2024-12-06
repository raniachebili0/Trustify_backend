import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiTags } from '@nestjs/swagger';
import { AzureBlobService } from 'src/services/AzureBlobService';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFileModel } from './document.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { LoggingInterceptor } from 'Interceptor/LoggingInterceptor';
import { InvoiceService } from 'src/services/InvoiceService';

@ApiTags('Document Section')
@Controller('document')
@UseGuards(AuthenticationGuard)
@UseInterceptors(LoggingInterceptor)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly azureBlobService: AzureBlobService,
    private readonly invoiceService: InvoiceService,
    @InjectModel(UploadedFileModel.name) private readonly fileModel: Model<UploadedFileModel>
    
  ) {}


  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Intercept the file upload
  async uploadFile(@UploadedFile() file: Express.Multer.File,
  @Req() req) {
    const userId = req.userId; // Extract authenticated user
  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }
    if (!file) {
      throw new Error('File is required'); // Handle case when no file is uploaded
    }

    // Generate a unique filename using the timestamp and original file name
    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload the file to Azure Blob Storage
    const uploadResult = await this.azureBlobService.uploadFile(file.buffer, fileName);

    // Save the file metadata in MongoDB
    const newFile = await this.fileModel.create({
      fileName: file.originalname, // Store the original file name
      blobId: uploadResult.blobId, // Store the Azure Blob ID (unique name)
      url: uploadResult.url, // Store the URL of the uploaded file in Azure Blob Storage
      userId : userId
    });
    // Return a response with the file metadata
    return {
      message: 'File uploaded successfully',
      file: fileName,
   
  }


  }





  /*
  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(+id);
  }*/
}
