import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { delay } from 'rxjs';
import {
  UploadedFileModel,
  UploadedFileModelDocument,
} from './document.schema';
import { BankingService } from 'src/services/BankingService';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(UploadedFileModel.name)
    private documentModel: Model<UploadedFileModelDocument>,
    
  ) {}
  async getTotalAmountFromAzureOpenAI(
    extractedText: string,
  ): Promise<{ totalAmount: string; iban: string }> {
    const azureOpenAiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureOpenAiApiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

    if (!azureOpenAiEndpoint || !azureOpenAiApiKey || !deploymentName) {
      throw new Error(
        'Azure OpenAI configuration is missing. Please check your environment variables.',
      );
    }
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('PDF parsing failed. No text could be extracted.');
    }

    try {
      console.log('Sending text to Azure OpenAI:', extractedText);

      const response = await axios.post(
        `${azureOpenAiEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`,
        {
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant specialized in extracting financial and banking information from text. Your task is to extract the total amount and the Account Number (IBAN) from an invoice text. Please respond in the following JSON format: {"total": "<total amount>", "Account Number": "<IBAN or account number>"}',
            },
            {
              role: 'user',
              content: `Extract the total amount and IBAN from the following invoice text:\n\n${extractedText}`,
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
        },
      );

      const chatResponse =
        response.data?.choices?.[0]?.message?.content?.trim();
      if (!chatResponse) {
        throw new Error('Azure OpenAI returned an empty or invalid response');
      }

      console.log('Azure OpenAI Response:', chatResponse);

      // Assuming `chatResponse` is a JSON object containing the structured data
      let totalAmount = '0';
      let iban = 'Not Found';

      try {
        const parsedResponse = JSON.parse(chatResponse);
        totalAmount = parsedResponse?.total || '0'; // Extract total
        iban = parsedResponse?.['Account Number'] || 'Not Found'; // Extract IBAN or account number
      } catch (error) {
        console.error('Error parsing Azure OpenAI response:', error.message);
        // Handle error as needed
      }

      console.log('Extracted Total Amount:', totalAmount);
      console.log('Extracted Account Number:', iban);

      return { totalAmount, iban };
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('Rate limit hit. Retrying after a delay...');
        await delay(1000); // Wait 1 second before retrying
        return await this.getTotalAmountFromAzureOpenAI(extractedText);
      }
      console.error('Azure OpenAI API Error:', error.message);
      throw new BadRequestException(
        'Failed to extract total amount using Azure OpenAI',
      );
    }
  }

  async findAll(userId: string): Promise<UploadedFileModel[]> {
    try {
      const blocs = await this.documentModel.find({ userId: userId }).exec();
      return blocs;
    } catch (error) {
      console.log(`Failed to find blocs by blocNb:`, error.stack);
      throw new Error('Error occurred while retrieving blocs');
    }
  }

  /*async compareFile(
    fileId: string,
    transaction: { fromAccount: string | null; toAccount: string; amount: number; txnType: string },
    cardDataArray: any[] // List of card data fetched from banking service
  ) {
    const document = await this.documentModel.findById(fileId).exec();
    if (!document) {
      throw new NotFoundException(`Document with ID ${fileId} not found`);
    }
  
    const { Accontenumber, totalAmount, typeDoc } = document;
    let ribFromTransaction: string;
  
    // Determine the RIB from transaction based on typeDoc (income or outcome)
    if (typeDoc === 'income') {
      ribFromTransaction = transaction.toAccount;
    } else if (typeDoc === 'outcome') {
      ribFromTransaction = transaction.fromAccount;
    }
  
    if (!ribFromTransaction) {
      throw new Error('Transaction account information is missing');
    }
  
    // Fetch card data from banking service (already provided to the service)
    if (!cardDataArray || cardDataArray.length === 0) {
      throw new Error('No card data found for the provided RIB');
    }
  
    // Perform amount comparison between the document's totalAmount and the transaction's amount
    const isAmountMatch = parseFloat(totalAmount) === transaction.amount;
  
    // Validate if the RIB from the transaction matches the document's account number
    const isRibMatch = Accontenumber === ribFromTransaction;
  
    // Check if both amount and RIB match
    const matches = isAmountMatch && isRibMatch;
  
    return {
      matches,
      isAmountMatch,
      isRibMatch,
      typeDoc,
      documentDetails: { Accontenumber, totalAmount, typeDoc },
      transactionDetails: transaction,
      cardDataArray, // Include the fetched card data in the response
    };
  }*/
  
    async compareFile(
      fileId: string,
      transaction: { fromAccount: string | null; toAccount: string; amount: number; txnType: string },
    ) {
      // Fetch document by fileId
      const document = await this.documentModel.findById(fileId).exec();
      if (!document) {
        throw new NotFoundException(`Document with ID ${fileId} not found`);
      }
  
      // Extract relevant fields from the document
      const { Accontenumber, totalAmount, typeDoc } = document;
  
      // Validate the transaction type based on typeDoc
      const isIncome =
        typeDoc === 'income' && transaction.toAccount !== null && Accontenumber === transaction.toAccount;
  
      const isOutcome =
        typeDoc === 'outcome' && transaction.fromAccount !== null && Accontenumber === transaction.fromAccount;
  
      // Handle transfer logic (toAccount or fromAccount can be relevant)
      const isTransfer =
        typeDoc === 'transfer' &&
        ((transaction.fromAccount && Accontenumber === transaction.fromAccount) ||
          (transaction.toAccount && Accontenumber === transaction.toAccount));
  
      // Perform amount comparison
      const isAmountMatch = parseFloat(totalAmount) === transaction.amount;
  
      // Determine if the document matches the transaction
      const matches = isAmountMatch && (isIncome || isOutcome || isTransfer);
  
      return {
        matches,
        isAmountMatch,
        typeDoc,
        documentDetails: { Accontenumber, totalAmount, typeDoc },
        transactionDetails: transaction,
      };
    }
  
  
  
  

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
