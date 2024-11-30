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
    if (!cardData.userId) {
      throw new Error('User ID is required to save card data');
    }
  
    const { number, expiry, cvc, type, balance, transactions, userId } = cardData;
  
    console.log('Card Data to be saved:', {
      number,
      expiry,
      cvc,
      type,
      balance,
      transactions,
      userId, // Ajout pour vérification
    });
  
    const creditCard = await this.cardModel.create({
      number,
      expiry,
      cvc,
      type,
      balance,
      transactions, // Embedding transactions
      userId,
    });
  
    return creditCard;
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
  async findOne(userId: string) : Promise <Card> {
    return this.cardModel.findById(userId).exec();
  }

  async findOneCard(userId: string): Promise<Card | null> {
    return this.cardModel.findOne({ userId }).exec();
  }
}
