import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './schema';
import { Model } from 'mongoose';

@Injectable()
export class CardService {

  
  constructor(@InjectModel(Card.name) private cardModel : Model <CardDocument>){}
  

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
 
  async findOne(id: number) : Promise <Card> {
    return this.cardModel.findById(id).exec();
  }
}
