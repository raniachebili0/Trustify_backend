import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
import axios from 'axios';
import * as pdfParse from 'pdf-parse';

@ApiTags('Document Section')
@Controller('document')
@UseGuards(AuthenticationGuard)
@UseInterceptors(LoggingInterceptor)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly azureBlobService: AzureBlobService,
    @InjectModel(UploadedFileModel.name) private readonly fileModel: Model<UploadedFileModel>
    
  ) {}


  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const userId = req.userId; // Extract authenticated user
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!file) {
      throw new Error('File is required');
    }

    // Generate a unique filename using the timestamp and original file name
    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload the file to Azure Blob Storage
    const uploadResult = await this.azureBlobService.uploadFile(file.buffer, fileName);



    let totalAmount: number | null = null;

    // Check file type and extract text
    if (file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(file.buffer);
        const extractedText = pdfData.text;

        // Send extracted text to Azure OpenAI API
        const chatResponse = await this.getTotalAmountFromAzureOpenAI(extractedText);

        // Parse the response for the total amount
        totalAmount = parseFloat(chatResponse?.match(/[\d,]+\.\d{2}/)?.[0]?.replace(',', '') || '0');
      } catch (error) {
        throw new BadRequestException('Error processing PDF file');
      }
    } else {
      throw new BadRequestException('Only PDF files are supported');
    }


        // Save the file metadata in MongoDB
        const newFile = await this.fileModel.create({
          fileName: file.originalname,
          blobId: uploadResult.blobId,
          url: uploadResult.url,
          userId: userId,
          totalAmount :totalAmount
    
        });

    // Return a response with the file metadata
    return {
      message: 'File uploaded successfully',
      file: fileName,
      totalAmount: totalAmount,
    };
  }

  private async getTotalAmountFromAzureOpenAI(extractedText: string): Promise<string> {
    const azureOpenAiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureOpenAiApiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

    if (!azureOpenAiEndpoint || !azureOpenAiApiKey || !deploymentName) {
        throw new Error('Azure OpenAI configuration is missing. Please check your environment variables.');
    }
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('PDF parsing failed. No text could be extracted.');
  }


  async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

    try {
        console.log('Sending text to Azure OpenAI:', extractedText);

        const response = await axios.post(
            `${azureOpenAiEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`,
            {
                messages: [
                    {
                        role: 'system',
                        content: "You are a helpful assistant specialized in reading invoices. Extract the total amount (in EUR) from the following invoice text. The total amount is typically labeled as 'Total', 'Total TTC', or 'Total HT'. Return the value in the format: 400.00, without any currency symbols.",
                    },
                    {
                        role: 'user',
                        content: `Extract the total amount from this invoice text: \n\n${extractedText}`,
                    },
                ],
                max_tokens: 150,
                temperature: 0.5,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': azureOpenAiApiKey,
                },
            }
        );

        // Parse the response from Azure OpenAI
        const chatResponse = response.data?.choices?.[0]?.message?.content?.trim();

        if (!chatResponse) {
            throw new Error('Azure OpenAI returned an empty or invalid response');
        }

        console.log('Azure OpenAI Response:', chatResponse);

        // Validate and return the extracted amount
        const amountMatch = chatResponse.match(/^\d+\.\d{2}$/); // Match a valid number like 400.00
        if (amountMatch) {
            return amountMatch[0]; // Return the matched amount
        } else {
            throw new Error('Azure OpenAI response did not contain a valid total amount');
        }
    } catch (error) {

      if (error.response?.status === 429) {
        console.log('Rate limit hit. Retrying after a delay...');
        await delay(1000); // Wait 1 second before retrying
        return await this.getTotalAmountFromAzureOpenAI(extractedText);
    }
        console.error('Azure OpenAI API Error:', error.message);
        throw new BadRequestException('Failed to extract total amount using Azure OpenAI');
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
