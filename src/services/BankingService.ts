import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BankingService {
  constructor(private readonly httpService: HttpService) {}

  async getCardData(cardNumber: string) {
    const url = `http://localhost:4000/credit_cards?number=${cardNumber}`;
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      console.log('Response data from banking API:', response.data); // Add this log to see the actual data
      return response.data;
    } catch (error) {
      console.error('Error fetching card data:', error); // Log any errors that occur during the API request
      throw new Error('Error fetching card data');
    }  
  }
}