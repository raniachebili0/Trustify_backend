import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiTags } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFileModel } from './document.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { LoggingInterceptor } from 'Interceptor/LoggingInterceptor';
import { InvoiceService } from 'src/services/InvoiceService';
import axios from 'axios';
import * as pdfParse from 'pdf-parse';
import * as Tesseract from 'tesseract.js';
import { LocalFileService } from 'src/services/AzureBlobService';
import { BankingService } from 'src/services/BankingService';

@ApiTags('Document Section')
@Controller('document')
@UseGuards(AuthenticationGuard)
@UseInterceptors(LoggingInterceptor)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly localFileService: LocalFileService,
    @InjectModel(UploadedFileModel.name)
    private readonly fileModel: Model<UploadedFileModel>,
    private readonly bankingService: BankingService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req,  @Body('type') type: string ) {
    const userId = req.userId; // Extract authenticated user
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!file) {
      throw new Error('File is required');
    }

    // Generate a unique filename using the timestamp and original file name
    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload the file to the local directory
    const fileUploaded = await this.localFileService.uploadFile(
      file.buffer,
      fileName,
    );

    let totalAmount: string | null = null;
    let iban: string | null = null;
    
    try {
      if (file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(file.buffer);
        const extractedText = pdfData.text;

        const chatResponse =
          await this.documentService.getTotalAmountFromAzureOpenAI(
            extractedText,
          );

        totalAmount = chatResponse.totalAmount;
        iban = chatResponse.iban;
      } else if (file.mimetype.startsWith('image/')) {
        const tesseractResult = await Tesseract.recognize(file.buffer, 'eng');
        const extractedText = tesseractResult.data.text;

        const chatResponse =
          await this.documentService.getTotalAmountFromAzureOpenAI(
            extractedText,
          );

        totalAmount =
          chatResponse.totalAmount
            ?.match(/[\d,]+\.\d{2}/)?.[0]
            ?.replace(',', '') || '0';
        iban =
          chatResponse.iban?.match(/[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}/)?.[0] ||
          'Not Found';
      } else {
        throw new BadRequestException('Only PDF and image files are supported');
      }
    } catch (error) {
      console.error('Error processing file:', error); // Log detailed error
      throw new BadRequestException('Error processing file');
    }

    // Save the file metadata in MongoDB
    const newFile = await this.fileModel.create({
      fileName: file.originalname,
      fileId: fileUploaded.fileId,
      url: fileUploaded.relativePath, // Save relative path here
      userId: userId,
      totalAmount: totalAmount,
      Accontenumber: iban,
      typeDoc: type,
      dateDeCreation :  new Date().toISOString(),
    });

    // Return a response with the file metadata
    return {
      message: 'File uploaded successfully',
      file: fileUploaded.relativePath, // Return relative path for the response
      totalAmount: totalAmount,
      iban: iban,
      type: type,
    };
  }

  @Get('getallDoc')
  async findAll(@Req() req): Promise<UploadedFileModel[]> {
    const userIdFromToken = req.userId;
    return this.documentService.findAll(userIdFromToken);
  }

  /*@Post('compare/:fileId')
async compareFileWithTransaction(
  @Param('fileId') fileId: string,
  @Body() body: { 
    credit_cards: { 
      rib: string; 
      transactions: { 
        fromAccount: string | null; 
        toAccount: string; 
        amount: number; 
        txnType: string 
      }[] 
    }[] 
  }
) {
  const { credit_cards } = body;

  // Ensure there's at least one credit card
  if (!credit_cards || credit_cards.length === 0) {
    throw new Error('No credit card data found');
  }

  // Validate that transactions array exists
  const transactions = credit_cards[0]?.transactions;
  if (!transactions || transactions.length === 0) {
    throw new Error('No transaction data found');
  }

  // Ensure each transaction contains the required fields
  transactions.forEach(transaction => {
    const requiredFields = ['fromAccount', 'toAccount', 'amount', 'txnType','txnRef', 'createdAt'];
    requiredFields.forEach(field => {
      if (!transaction[field]) {
        throw new Error(`Transaction object is missing required field: ${field}`);
      }
    });
  });

  // Ensure rib matches the provided rib
  const rib = credit_cards[0].rib;
  const cardData = await this.bankingService.getCardData(rib);
  if (!cardData || cardData.length === 0) {
    throw new Error(`No card data found for the provided RIB: ${rib}`);
  }

  // Proceed with the comparison
  const transaction = transactions[0]; // Assuming we're dealing with the first transaction
  return await this.documentService.compareFile(fileId, transaction, cardData);
}*/
@Post('compare/:fileId')
  async compareFileWithTransaction(
    @Param('fileId') fileId: string,
    @Body() transaction: { fromAccount: string | null; toAccount: string; amount: number; txnType: string },
  ) {
    // Pass the fileId and transaction data to the service
    return await this.documentService.compareFile(fileId, transaction);
  }

  /*
  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
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
