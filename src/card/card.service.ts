import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Card, CardDocument } from './credit-card.schema';

@Injectable()
export class CardService {

  
  constructor(
  @InjectModel(Card.name) private cardModel : Model <CardDocument>, ){}

  async saveCardData(cardData: any) {
    if (Array.isArray(cardData) && cardData.length > 0) {
      const { number, expiry, cvc, type, balance, transactions , userId = "kkkk" } = cardData[0]; // Access the first object in the array
  
      console.log('Card Data to be saved:', { number, expiry, cvc, type, balance, transactions }); // Log the data
  
      const creditCard = await this.cardModel.create({
        number,
        expiry,
        cvc,
        type,
        balance,
        transactions,  // Directly embed transactions in the card document
        userId ,
      });
  
      return creditCard;
    } else {
      throw new Error('Invalid card data format');
    }
  }
  
  
/*
  async create(createCardDto: CreateCardDto): Promise<Card> {
    const createCard = new this.cardModel(createCardDto);
    return createCard.save();
  }

  async findAll() : Promise<Card[]> {
    return this.cardModel.find().exec();
  }

  async update(id: number, updateCardDto: UpdateCardDto) :Promise <Card> {
    return this.cardModel.findByIdAndUpdate(id, updateCardDto, { new: true }).exec();
  }

  async remove(id: number):  Promise <Card> {
    return this.cardModel.findByIdAndDelete(id).exec();
  }
 */
  async findOne(id: string) : Promise <Card> {
    return this.cardModel.findById(id).exec();
  }

  async findOneCard(id: string): Promise<Card | null> {
    return this.cardModel.findOne({ userId: id }).exec();
  }
}
