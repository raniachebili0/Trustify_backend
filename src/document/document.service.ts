import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import axios from 'axios';
import { delay } from 'rxjs';

@Injectable()
export class DocumentService {
  

   async getTotalAmountFromAzureOpenAI(extractedText: string): Promise<string> {
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



  
  create(createDocumentDto: CreateDocumentDto) {
    return 'This action adds a new document';
  }

  findAll() {
    return `This action returns all document`;
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
